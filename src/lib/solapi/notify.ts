import crypto from "crypto";

export function normalizePhoneNumber(raw: string): string {
  return (raw || "").replace(/[^0-9]/g, "");
}

export function isValidKoreanPhone(raw: string): boolean {
  const digits = normalizePhoneNumber(raw);
  return /^01[016789]\d{7,8}$/.test(digits);
}

interface SendReportAccessParams {
  to: string;
  reportUrl: string;
  pin: string;
}

/**
 * 솔라피(Solapi) REST API v4를 이용해 리포트 전용 링크 + 랜덤 4자리 PIN을 발송합니다.
 * 환경변수 미설정 시 예외를 던지지 않고 경고 로그만 남깁니다.
 */
export async function sendReportAccessNotification({
  to,
  reportUrl,
  pin,
}: SendReportAccessParams): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.SOLAPI_API_KEY?.trim();
  const apiSecret = process.env.SOLAPI_API_SECRET?.trim();
  const sender = normalizePhoneNumber(process.env.SOLAPI_SENDER || "");
  const kakaoPfid =
    process.env.SOLAPI_KAKAO_PFID?.trim() ||
    "KA01PF2611161152464880RFLCOHf178";
  const kakaoTemplateId =
    process.env.SOLAPI_KAKAO_TEMPLATE_ID?.trim() ||
    "KA01TP261116115838172vAOmiXQZnng";
  const relayUrl = process.env.SOLAPI_RELAY_URL?.trim();
  const relayToken = process.env.SOLAPI_RELAY_TOKEN?.trim();
  const hasKakaoConfig = Boolean(kakaoPfid && kakaoTemplateId);
  const recipient = normalizePhoneNumber(to);

  if (!recipient || !isValidKoreanPhone(recipient)) {
    return { sent: false, reason: "INVALID_RECIPIENT" };
  }

  // 1) VPS 릴레이 모드 (https://notify-relay.yeonundang.com/... 경유)
  if (relayUrl && relayToken) {
    try {
      const res = await fetch(relayUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${relayToken}`,
        },
        body: JSON.stringify({
          phone: recipient,
          productId: "lovepattern-report",
          reportUrl,
          pin,
          pfId: kakaoPfid,
          templateId: kakaoTemplateId,
          variables: {
            "#{reportUrl}": reportUrl,
            "#{pin}": pin,
          },
        }),
      });

      if (res.ok) {
        return { sent: true };
      }

      const errBody = await res.text();
      console.error("[Solapi Relay] 발송 실패, 직접 호출 폴백 시도:", res.status, errBody);
      if (!apiKey || !apiSecret) {
        return { sent: false, reason: `RELAY_HTTP_${res.status}` };
      }
    } catch (err) {
      console.error("[Solapi Relay] 네트워크 오류, 직접 호출 폴백 시도:", err);
      if (!apiKey || !apiSecret) {
        return { sent: false, reason: "RELAY_NETWORK_ERROR" };
      }
    }
  }

  // 2) 직접 발송 모드: 카카오 알림톡 설정(PFID + 템플릿 ID)이 있으면 발신번호(SOLAPI_SENDER) 없이도 알림톡 단독 발송 가능
  if (!apiKey || !apiSecret || (!hasKakaoConfig && !sender)) {
    console.warn(
      "[Solapi] 필수 환경변수(API_KEY / SECRET 및 KAKAO 설정 또는 SENDER) 미설정으로 발송을 건너뜁니다.",
      { recipientMask: `${recipient.slice(0, 3)}****${recipient.slice(-4)}` }
    );
    return { sent: false, reason: "MISSING_ENV" };
  }

  const date = new Date().toISOString();
  const salt = crypto.randomBytes(16).toString("hex");
  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(date + salt)
    .digest("hex");

  const text = [
    `[러브패턴] 심층 리포트 & 1:1 AI 상담(3회)이 열렸습니다.`,
    ``,
    `🔗 전용 열람 링크:`,
    `${reportUrl}`,
    ``,
    `🔒 열람 PIN 번호: ${pin}`,
    ``,
    `다른 브라우저나 카톡 인앱에서 이동하더라도 위 링크 + PIN 4자리로 언제든 다시 보고 AI 상담을 이어갈 수 있습니다.`,
  ].join("\n");

  const messagePayload: Record<string, any> = {
    to: recipient,
  };

  if (sender) {
    messagePayload.from = sender;
  }

  if (hasKakaoConfig) {
    messagePayload.kakaoOptions = {
      pfId: kakaoPfid,
      templateId: kakaoTemplateId,
      disableSms: !sender, // 발신번호 미등록 시 문자 대체발송 비활성화(알림톡 단독 발송)
      variables: {
        "#{reportUrl}": reportUrl,
        "#{pin}": pin,
      },
    };
  } else {
    messagePayload.text = text;
    messagePayload.subject = "[러브패턴] 리포트 & 열람 PIN 안내";
    messagePayload.type = "LMS";
  }

  const endpointUrl =
    process.env.SOLAPI_API_URL?.trim() ||
    "https://api.solapi.com/messages/v4/send";

  try {
    const res = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`,
      },
      body: JSON.stringify({ message: messagePayload }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("[Solapi] 발송 실패:", res.status, errBody);
      return { sent: false, reason: `HTTP_${res.status}` };
    }

    return { sent: true };
  } catch (err) {
    console.error("[Solapi] 네트워크 오류:", err);
    return { sent: false, reason: "NETWORK_ERROR" };
  }
}
