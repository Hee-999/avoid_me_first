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

    const mode = row.derived_context?.analysis_mode === "flirting" ? "썸 · 호감도 판독" : "재회 · 애매한 사이 판독";
    const targetLabel = row.extracted_signals?.target_speaker_label || "상대방";
    const history: ChatMessageItem[] = Array.isArray(currentChat.messages)
      ? currentChat.messages.slice(-8)
      : [];

    const historyText =
      history.length > 0
        ? history
            .map((m) => `${m.role === "user" ? "내담자" : "AI 상담사"}: ${m.content}`)
            .join("\n")
        : "(이전 대화 없음)";

    const reportSummary = row.premium_report?.executive_summary
      ? `${row.premium_report.executive_summary.headline}\n${row.premium_report.executive_summary.body}`
      : row.derived_context?.relationship_context || "";

    const prompt = `
당신은 한국 최고의 실전 연애·관계 심리 전략가입니다.
내담자가 업로드한 카카오톡 대화 분석 결과를 바탕으로 1:1 맞춤 상담을 진행합니다.

[상담 규칙]
1. JSON 형식({ ... })이나 마크다운 코드블록 없이, 오직 사람이 읽는 일반 텍스트(줄바꿈 문단)로만 답변하세요.
2. 뜬구름 잡는 위로가 아니라, 상대(${targetLabel})의 실제 반응과 두 사람의 온도차에 근거해 직설적이고 현실적으로 답하세요 ("회피형 애착 유형을 고려할 때" 같은 딱딱한 심리학 용어나 '오늘 점심 난 샌드위치!' 같은 뜬금없는 예시 금지).
3. 내담자가 보낼 카톡 문장이 필요할 때는 실제 한국 2030이 카톡에서 쓰는 자연스럽고 담백한 구어체로 1~2개 제시하세요.
4. 답변은 모바일에서 읽기 좋게 2~3문단(350자 내외)으로 핵심만 명쾌하게 정리하세요.

[분석 컨텍스트]
- 모드: ${mode}
- 대상: ${targetLabel}
- 주 애착 유형: ${row.primary_type} (불안 ${row.anxiety_score} / 회피 ${row.avoidance_score})
- 관계 흐름 요약: ${row.derived_context?.relationship_context || "정보 없음"}
- 핵심 장면들: ${JSON.stringify(row.derived_context?.key_situations || [])}
- 리포트 핵심 결론: ${reportSummary}

[이전 1:1 상담 내역]
${historyText}

[내담자의 새 질문]
${userMessage}
`.trim();

    const llmRes = await callResilientLLM(prompt, 1200, false);
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
