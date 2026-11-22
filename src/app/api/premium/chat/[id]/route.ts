import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin, hashToken } from "@/lib/supabase/server";
import { callResilientLLM } from "@/lib/analysis/llmRouter";
import { PRICING } from "@/config/pricing";

export interface ChatMessageItem {
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

function cleanAssistantReply(raw: string): string {
  const trimmed = (raw || "").trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      const firstStringVal = Object.values(parsed).find((v) => typeof v === "string") as string | undefined;
      if (firstStringVal) {
        return firstStringVal.replace(/\\n/g, "\n").trim();
      }
    } catch {
      // Fallback regex if partial/malformed JSON
      const match = trimmed.match(/:\s*"([\s\S]*)"\s*\}$/);
      if (match?.[1]) {
        return match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').trim();
      }
    }
  }
  return trimmed.replace(/\\n/g, "\n");
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const userMessage = typeof body?.message === "string" ? body.message.trim() : "";

    if (!userMessage || userMessage.length > 1000) {
      return NextResponse.json(
        { error: "질문 내용을 1자 이상 1,000자 이내로 입력해주세요." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const ownerToken = cookieStore.get("avoidance_owner_token")?.value;
    const pinVerifiedHash = cookieStore.get(`avoidance_pin_verified_${id}`)?.value;

    const { data: row, error: fetchError } = await supabaseAdmin
      .from("analyses")
      .select(
        "id, owner_token_hash, premium_unlocked, primary_type, anxiety_score, avoidance_score, derived_context, premium_report, extracted_signals, status"
      )
      .eq("id", id)
      .single();

    if (fetchError || !row) {
      return NextResponse.json({ error: "분석 결과를 찾을 수 없습니다." }, { status: 404 });
    }

    const isOwnerByToken = Boolean(ownerToken && hashToken(ownerToken) === row.owner_token_hash);
    const isOwnerByPin = Boolean(
      pinVerifiedHash &&
      row.status?.access?.pin_hash &&
      pinVerifiedHash === row.status.access.pin_hash
    );

    if (!isOwnerByToken && !isOwnerByPin) {
      return NextResponse.json({ error: "상담 권한이 없습니다. 열람 PIN 인증 후 이용해주세요." }, { status: 401 });
    }

    if (!row.premium_unlocked) {
      return NextResponse.json({ error: "심층 리포트 잠금 해제 후 이용할 수 있습니다." }, { status: 403 });
    }

    const currentChat = row.status?.chat || {
      remaining_turns: PRICING.REPORT.initialChatTurns,
      total_used: 0,
      messages: [],
    };

    const totalUsedBefore = Number(currentChat.total_used) || 0;
    const hasMessages = Array.isArray(currentChat.messages) && currentChat.messages.length > 0;
    let remainingBefore =
      currentChat.remaining_turns !== undefined && currentChat.remaining_turns !== null
        ? Number(currentChat.remaining_turns)
        : PRICING.REPORT.initialChatTurns;

    // Auto-heal legacy/test records where 0 turns were initialized before any question was ever asked
    if (remainingBefore <= 0 && totalUsedBefore === 0 && !hasMessages) {
      remainingBefore = PRICING.REPORT.initialChatTurns;
    }
    if (remainingBefore <= 0) {
      return NextResponse.json(
        { error: "NO_TURNS_LEFT", remaining_turns: 0 },
        { status: 402 }
      );
    }

    const isFlirting = row.derived_context?.analysis_mode === "flirting";
    const mode = isFlirting ? "썸 · 호감도 판독" : "재회 · 애매한 사이 판독";
    const targetLabel = row.extracted_signals?.target_speaker_label || "상대방";
    const v3 = row.derived_context?.v3_metrics || {};
    const report = row.premium_report || {};
    const history: ChatMessageItem[] = Array.isArray(currentChat.messages)
      ? currentChat.messages.slice(-8)
      : [];

    const historyText =
      history.length > 0
        ? history
            .map((m) => `${m.role === "user" ? "내담자" : "AI 상담사"}: ${m.content}`)
            .join("\n")
        : "(이전 대화 없음)";

    const fullReportContext = {
      v3_metrics: {
        user_temperature: v3.user_temperature ?? null,
        target_temperature: v3.target_temperature ?? null,
        success_probability: v3.success_probability ?? null,
        backfire_risk_percent: v3.backfire_risk_percent ?? null,
        tease_scene_summary: v3.tease_scene_summary ?? null,
      },
      context_intake: row.derived_context?.context_intake || null,
      relationship_context: row.derived_context?.relationship_context || null,
      key_situations: row.derived_context?.key_situations || [],
      paid_report: {
        executive_summary: report.executive_summary || null,
        evidence_deep_dive: report.evidence_deep_dive || [],
        interaction_loop: report.interaction_loop || null,
        communication_guide: report.communication_guide || [],
        conversation_rewrites: report.conversation_rewrites || [],
        recovery_signals: report.recovery_signals || [],
        risk_signals: report.risk_signals || [],
        action_plan: report.action_plan || null,
        manual_summary: report.manual_summary || null,
        attachment_profile: report.attachment_profile || null,
      },
    };

    const modeRule = isFlirting
      ? `[썸 모드 전용 지침] 두 사람은 현재 '썸 · 호감 탐색' 단계입니다. '이별/재회/방어벽' 같은 무거운 단어 대신, 상대 온도(${v3.target_temperature ?? "?"}%)와 썸 성사 가능성(${v3.success_probability ?? "?"}%)을 기준으로 티키타카, 약속 잡기, 부담 없는 호감 표현 위주로 코칭하세요.`
      : `[재회·애매한 사이 전용 지침] 두 사람은 현재 '재회 · 거리두기/애매한 사이' 단계입니다. 상대 온도(${v3.target_temperature ?? "?"}%), 재회 가능성(${v3.success_probability ?? "?"}%), 성급한 연락 주의 지수(${v3.backfire_risk_percent ?? "?"}%)를 기준으로 상대의 감정 소모와 방어벽을 자극하지 않으면서 다시 대화를 여는 전략을 코칭하세요.`;

    const prompt = `
당신은 한국 최고의 실전 연애·카톡 심리 전략가입니다.
내담자는 이미 아래 [유료 심층 리포트 전문]을 읽고 결제까지 마친 상태입니다.
단순 일반론이나 뻔한 위로가 아니라, **반드시 아래 리포트에 담긴 실제 수치·장면·추천 가이드**를 직접 인용하며 내담자의 추가 질문에 1:1로 깊이 있게 답변하세요.

${modeRule}

[상담 규칙]
1. JSON 형식({ ... })이나 마크다운 코드블록(\`\`\`) 없이, 사람이 모바일에서 바로 읽기 편한 일반 텍스트(줄바꿈 문단)로만 답변하세요.
2. 답변 첫 문단에서 리포트의 실제 데이터(예: 상대 온도 ${v3.target_temperature ?? "?"}%, 포착된 장면 제목, 주의 지수 등)를 최소 1가지 이상 자연스럽게 짚어주며 "내 대화를 정확히 보고 답해준다"는 확신을 주세요.
3. 내담자가 카톡 답장, 선톡, 문장 첨삭, 연락 타이밍을 물어보면 반드시 아래 형태로 **실제 한국 2030 카톡 구어체 초안 2가지**를 제공하세요:
   - ① 부담 없는 가벼운 톤: "..."
   - ② 조금 더 솔직하게 마음을 여는 톤: "..."
   그리고 각 문장이 왜 이 상대(${targetLabel})에게 먹히는지 리포트 근거로 1줄씩 설명하세요.
4. 딱딱한 심리학 용어('회피형 애착', '방어기제' 남발 등)나 '오늘 점심 샌드위치' 같은 뜬금없는 비유는 쓰지 말고, 다정하지만 직설적인 ~해요/~거예요 체로 500~700자 내외(모바일 3~4문단)로 충실하게 답변하세요.

[분석 및 유료 심층 리포트 전문]
${JSON.stringify(fullReportContext, null, 2)}

[이전 1:1 상담 내역]
${historyText}

[내담자의 새 질문]
${userMessage}
`.trim();

    const llmRes = await callResilientLLM(prompt, 1800, false);
    const remainingAfter = remainingBefore - 1;
    let assistantReply = cleanAssistantReply(llmRes.content);

    if (remainingAfter === 0) {
      assistantReply +=
        "\n\n💡 추천 답장을 보낸 뒤 상대방의 첫 반응에 따라 다음 대응이 완전히 달라집니다. 답장이 오면 문자로 발송된 전용 링크(또는 홈 화면 조회)로 다시 들어와 상황을 알려주세요!";
    }

    const nowIso = new Date().toISOString();
    const updatedMessages: ChatMessageItem[] = [
      ...(Array.isArray(currentChat.messages) ? currentChat.messages : []),
      { role: "user", content: userMessage, created_at: nowIso },
      { role: "assistant", content: assistantReply, created_at: nowIso },
    ];

    const updatedChat = {
      remaining_turns: remainingAfter,
      total_used: (Number(currentChat.total_used) || 0) + 1,
      messages: updatedMessages,
      created_at: currentChat.created_at || nowIso,
      updated_at: nowIso,
    };

    const { error: updateError } = await supabaseAdmin
      .from("analyses")
      .update({
        status: {
          ...(row.status || {}),
          chat: updatedChat,
        },
      })
      .eq("id", id);

    if (updateError) {
      console.error("[CHAT] Failed to persist chat turn:", updateError);
      return NextResponse.json({ error: "상담 내역 저장에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({
      reply: assistantReply,
      remaining_turns: remainingAfter,
      total_used: updatedChat.total_used,
      messages: updatedMessages,
    });
  } catch (error) {
    console.error("Premium Chat POST Error:", error);
    return NextResponse.json(
      { error: "AI 상담 응답 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
