import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import crypto from "crypto";

const TYPE_NAMES: Record<string, string> = {
  secure: "안정형",
  preoccupied: "불안형(몰입)",
  dismissing: "거부회피형",
  fearful: "공포회피형",
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 1. Authentication Check (Header or Query Param)
    const configuredSecret = process.env.MONITOR_SECRET;
    if (!configuredSecret) {
      return NextResponse.json(
        { error: "Server misconfiguration: MONITOR_SECRET not set" },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get("Authorization");
    const bearerSecret = authHeader?.startsWith("Bearer ") ? authHeader.substring(7).trim() : null;
    const querySecret = searchParams.get("secret");
    const providedSecret = bearerSecret || querySecret;

    if (!providedSecret) {
      return NextResponse.json({ error: "Unauthorized: Missing secret key" }, { status: 401 });
    }

    // Timing-safe secret verification to prevent timing attacks
    const providedBuffer = Buffer.from(providedSecret);
    const configuredBuffer = Buffer.from(configuredSecret);
    const isValid =
      providedBuffer.length === configuredBuffer.length &&
      crypto.timingSafeEqual(providedBuffer, configuredBuffer);

    if (!isValid) {
      return NextResponse.json({ error: "Unauthorized: Invalid secret key" }, { status: 401 });
    }

    // 2. Query Window (Default: 5 minutes)
    const minutes = Math.max(1, parseInt(searchParams.get("minutes") || "5", 10));
    const sinceTime = new Date(Date.now() - minutes * 60 * 1000).toISOString();

    // 3. Supabase Read-Only Queries
    // Query 1: New Free Analyses in the last N minutes
    const { data: freeAnalyses, error: freeError } = await supabaseAdmin
      .from("analyses")
      .select("id, created_at, primary_type, anxiety_score, avoidance_score, extracted_signals, premium_unlocked")
      .gte("created_at", sinceTime)
      .order("created_at", { ascending: false });

    if (freeError) {
      console.error("[MONITOR API] Error querying free analyses:", freeError);
      return NextResponse.json({ error: "Failed to query database" }, { status: 500 });
    }

    // Query 2: New Paid Conversions in the last N minutes
    const { data: paidAnalyses, error: paidError } = await supabaseAdmin
      .from("analyses")
      .select("id, purchased_at, primary_type, status, extracted_signals")
      .eq("premium_unlocked", true)
      .gte("purchased_at", sinceTime)
      .order("purchased_at", { ascending: false });

    if (paidError) {
      console.error("[MONITOR API] Error querying paid analyses:", paidError);
      return NextResponse.json({ error: "Failed to query database" }, { status: 500 });
    }

    const freeCount = freeAnalyses?.length || 0;
    const paidCount = paidAnalyses?.length || 0;

    // If no new events in this window, return silent indicator
    if (freeCount === 0 && paidCount === 0) {
      return NextResponse.json({
        hasEvents: false,
        windowMinutes: minutes,
        count: { free: 0, paid: 0 },
        message: null,
      });
    }

    // 4. Format Telegram Alert Message
    const lines: string[] = [
      `🔔 [회피형 판독기 실시간 알림]`,
      `⏱️ 최근 ${minutes}분간 새 소식이 도착했습니다.\n`,
    ];

    if (paidCount > 0) {
      lines.push(`💰 【유료 결제 완료】 ${paidCount}건!`);
      paidAnalyses?.forEach((item, idx) => {
        const timeStr = item.purchased_at
          ? new Date(item.purchased_at).toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul" })
          : "방금 전";
        const typeLabel = TYPE_NAMES[item.primary_type] || item.primary_type || "분석 완료";
        const targetName = item.extracted_signals?.target_speaker_label || "상대방";
        const amount = item.status?.payment?.amount
          ? `${Number(item.status.payment.amount).toLocaleString()}원`
          : "4,900원";

        lines.push(`  ${idx + 1}. [${amount}] 대상: ${targetName} (${typeLabel}) - ${timeStr}`);
      });
      lines.push("");
    }

    if (freeCount > 0) {
      lines.push(`🔍 【신규 무료 분석】 ${freeCount}건`);
      freeAnalyses?.forEach((item, idx) => {
        const timeStr = item.created_at
          ? new Date(item.created_at).toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul" })
          : "방금 전";
        const typeLabel = TYPE_NAMES[item.primary_type] || item.primary_type || "분석 완료";
        const targetName = item.extracted_signals?.target_speaker_label || "상대방";
        const scores = `불안 ${item.anxiety_score ?? "-"}점 / 회피 ${item.avoidance_score ?? "-"}점`;

        lines.push(`  ${idx + 1}. 대상: ${targetName} 👉 ${typeLabel} (${scores}) - ${timeStr}`);
      });
    }

    const message = lines.join("\n");

    return NextResponse.json({
      hasEvents: true,
      windowMinutes: minutes,
      count: { free: freeCount, paid: paidCount },
      message,
      data: {
        free: freeAnalyses,
        paid: paidAnalyses,
      },
    });
  } catch (error: any) {
    console.error("[MONITOR API] Unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
