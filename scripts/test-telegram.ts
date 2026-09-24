import fs from "fs";
import path from "path";
import { sendTelegramMessage } from "../src/lib/telegram/notify";

// Zero-dependency .env.local loader for local testing
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch {
  // Ignore if reading .env.local fails
}

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
