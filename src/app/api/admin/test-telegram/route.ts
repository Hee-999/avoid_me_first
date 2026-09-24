import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram/notify";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const configuredSecret = process.env.MONITOR_SECRET || "sec_ar_9e3a7b1c4d82f5e0618a93cb45d2f107";
    const providedSecret = searchParams.get("secret");

    if (providedSecret !== configuredSecret) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing secret parameter (?secret=...)" },
        { status: 401 }
      );
    }

    const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

    const envStatus = {
      NODE_ENV: process.env.NODE_ENV,
      hasBotToken: !!token,
      hasChatId: !!chatId,
    };

    if (!token || !chatId) {
      return NextResponse.json(
        {
          success: false,
          message: "텔레그램 환경변수가 서버에 등록되어 있지 않습니다. Netlify 환경변수 등록 후 'Deploy site' 재배포가 필요합니다.",
          envStatus,
        },
        { status: 500 }
      );
    }

    const now = new Date().toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul" });
    const testMessage = [
      `🔔 <b>[텔레그램 연동 테스트 성공]</b>`,
      `• 환경: <b>${process.env.NODE_ENV || "unknown"}</b>`,
      `• 발송 일시: ${now}`,
      `• 메시지: 연애유형판독기 텔레그램 봇 알림이 정상 작동 중입니다!`,
    ].join("\n");

    const sent = await sendTelegramMessage(testMessage);

    if (sent) {
      return NextResponse.json({
        success: true,
        message: "텔레그램 테스트 메시지가 성공적으로 발송되었습니다! 텔레그램을 확인해보세요.",
        envStatus,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "텔레그램 API 호출에 실패했습니다. 서버 로그를 확인해주세요.",
          envStatus,
        },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error("[TEST TELEGRAM] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error?.message },
      { status: 500 }
    );
  }
}
