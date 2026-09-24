import { config } from "dotenv";
config({ path: ".env.local" });
import { sendTelegramMessage } from "../src/lib/telegram/notify";

async function run() {
  console.log("Testing Telegram Bot notification from .env.local...");
  console.log("TELEGRAM_BOT_TOKEN exists:", !!process.env.TELEGRAM_BOT_TOKEN);
  console.log("TELEGRAM_CHAT_ID exists:", !!process.env.TELEGRAM_CHAT_ID);

  const res = await sendTelegramMessage(
    "🔔 [로컬 CLI 테스트] 연애유형판독기 텔레그램 봇 알림이 정상 작동 중입니다!"
  );
  if (res) {
    console.log("✅ [성공] 텔레그램 메시지가 전송되었습니다! 텔레그램 방을 확인해주세요.");
  } else {
    console.error("❌ [실패] 텔레그램 메시지 전송에 실패했습니다.");
  }
}

run();
