const TYPE_NAMES: Record<string, string> = {
  secure: "안정형",
  preoccupied: "불안형(몰입)",
  dismissing: "거부회피형",
  fearful: "공포회피형",
};

/**
 * Escapes characters for Telegram HTML parse_mode
 */
export function escapeTelegramHtml(text: string): string {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Sends a message to the configured Telegram chat.
 * Returns true if successful, false otherwise.
 */
export async function sendTelegramMessage(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!token || !chatId) {
    console.warn(
      `[TELEGRAM] Environment variable missing: token=${!!token}, chatId=${!!chatId}. Notification skipped.`
    );
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
      console.error(`[TELEGRAM] HTTP ${response.status} Failed to send notification:`, err);
      return false;
    }

    console.log("[TELEGRAM] Notification successfully sent to Telegram.");
    return true;
  } catch (error) {
    console.error("[TELEGRAM] Network/fetch error sending notification:", error);
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
}): Promise<boolean> {
  const typeLabel = (data.primaryType && TYPE_NAMES[data.primaryType]) || data.primaryType || "분석 완료";
  const rawTargetName = data.targetSpeaker || "상대방";
  const targetName = escapeTelegramHtml(rawTargetName);
  const now = new Date().toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul" });

  const message = [
    `🔍 <b>[신규 무료 분석 접수]</b>`,
    `• 대상자: <b>${targetName}</b>`,
    `• 판독 결과: <b>${escapeTelegramHtml(typeLabel)}</b>`,
    `• 애착 점수: 불안 ${data.anxietyScore ?? "-"}점 / 회피 ${data.avoidanceScore ?? "-"}점`,
    `• 일시: ${now}`,
    `• 분석 ID: <code>${escapeTelegramHtml(data.id.slice(0, 8))}...</code>`,
  ].join("\n");

  return await sendTelegramMessage(message);
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
}): Promise<boolean> {
  const typeLabel = (data.primaryType && TYPE_NAMES[data.primaryType]) || data.primaryType || "심층 리포트";
  const rawTargetName = data.targetSpeaker || "상대방";
  const targetName = escapeTelegramHtml(rawTargetName);
  const formattedAmount = `${Number(data.amount).toLocaleString()}원`;
  const now = new Date().toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul" });

  const message = [
    `🎉 <b>【유료 결제 완료!!】</b> 💰`,
    `• 결제 금액: <b>${formattedAmount}</b>`,
    `• 대상자: <b>${targetName}</b> (${escapeTelegramHtml(typeLabel)})`,
    `• 승인 일시: ${now}`,
    `• 주문 번호: <code>${escapeTelegramHtml(data.orderId || data.id)}</code>`,
  ].join("\n");

  return await sendTelegramMessage(message);
}
