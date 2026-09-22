const TYPE_NAMES: Record<string, string> = {
  secure: "안정형",
  preoccupied: "불안형(몰입)",
  dismissing: "거부회피형",
  fearful: "공포회피형",
};

/**
 * Sends a message to the configured Telegram chat.
 * Fails silently so it never interrupts the main user-facing request flow.
 */
export async function sendTelegramMessage(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[TELEGRAM] Failed to send notification:", err);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[TELEGRAM] Error sending notification:", error);
    return false;
  }
}

/**
 * Notification for when a user completes a free analysis
 */
export async function notifyFreeAnalysis(data: {
  id: string;
  targetSpeaker?: string;
  primaryType?: string;
  anxietyScore?: number;
  avoidanceScore?: number;
}) {
  const typeLabel = (data.primaryType && TYPE_NAMES[data.primaryType]) || data.primaryType || "분석 완료";
  const targetName = data.targetSpeaker || "상대방";
  const now = new Date().toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul" });

  const message = [
    `🔍 <b>[신규 무료 분석 접수]</b>`,
    `• 대상자: <b>${targetName}</b>`,
    `• 판독 결과: <b>${typeLabel}</b>`,
    `• 애착 점수: 불안 ${data.anxietyScore ?? "-"}점 / 회피 ${data.avoidanceScore ?? "-"}점`,
    `• 일시: ${now}`,
    `• 분석 ID: <code>${data.id.slice(0, 8)}...</code>`,
  ].join("\n");

  // Asynchronously fire-and-forget
  sendTelegramMessage(message).catch(() => {});
}

/**
 * Notification for when a user completes a 4,900 KRW payment
 */
export async function notifyPaidConversion(data: {
  id: string;
  amount: number;
  targetSpeaker?: string;
  primaryType?: string;
  orderId?: string;
}) {
  const typeLabel = (data.primaryType && TYPE_NAMES[data.primaryType]) || data.primaryType || "심층 리포트";
  const targetName = data.targetSpeaker || "상대방";
  const formattedAmount = `${Number(data.amount).toLocaleString()}원`;
  const now = new Date().toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul" });

  const message = [
    `🎉 <b>【유료 결제 완료!!】</b> 💰`,
    `• 결제 금액: <b>${formattedAmount}</b>`,
    `• 대상자: <b>${targetName}</b> (${typeLabel})`,
    `• 승인 일시: ${now}`,
    `• 주문 번호: <code>${data.orderId || data.id}</code>`,
  ].join("\n");

  // Asynchronously fire-and-forget
  sendTelegramMessage(message).catch(() => {});
}
