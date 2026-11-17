import { NextResponse } from "next/server";
import { supabaseAdmin, hashToken } from "@/lib/supabase/server";
import { notifyPaidConversion } from "@/lib/telegram/notify";
import { sendReportAccessNotification } from "@/lib/solapi/notify";
import { PRICING } from "@/config/pricing";
import crypto from "crypto";

async function recordPaymentFailure(
  analysisId: string,
  orderId: string,
  errorMessage: string,
  errorCode?: string | null,
  tid?: string | null
) {
  try {
    const { data } = await supabaseAdmin
      .from("analyses")
      .select("status")
      .eq("id", analysisId)
      .single();
    if (!data) return;

    const storedPayment = data.status?.payment;
    if (!storedPayment || storedPayment.order_id !== orderId) return;

    const failedStatus = {
      ...(data.status || {}),
      payment: {
        ...storedPayment,
        ...(tid ? { tid } : {}),
        payment_status: "failed",
        error_code: errorCode || undefined,
        error_message: errorMessage,
        failed_at: new Date().toISOString(),
      },
    };
    await supabaseAdmin.from("analyses").update({ status: failedStatus }).eq("id", analysisId);
  } catch (err) {
    console.error("[PAYMENT] Failed to record payment failure:", err);
  }
}

export async function POST(request: Request) {
  try {
    const text = await request.text();
    const params = new URLSearchParams(text);

    const authResultCode = params.get("authResultCode");
    const authResultMsg = params.get("authResultMsg");
    const tid = params.get("tid");
    const clientId = params.get("clientId");
    const orderId = params.get("orderId");
    const amountStr = params.get("amount");
    const authToken = params.get("authToken");
    const signature = params.get("signature");

    console.log(`[PAYMENT] authentication returned for order: ${orderId}, code: ${authResultCode}`);

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const [analysisId] = orderId.split("_");

    // Redirect URL base
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
    const redirectUrl = `${siteUrl}/result/${analysisId}`;

    if (authResultCode !== "0000") {
      const msg = authResultMsg || "결제 인증 실패";
      console.warn(`[PAYMENT] Auth failed (${authResultCode}): ${msg}`);
      await recordPaymentFailure(analysisId, orderId, msg, authResultCode, tid);
      return NextResponse.redirect(`${redirectUrl}?error=${encodeURIComponent(msg)}`, 302);
    }

    if (!tid || !clientId || !amountStr || !authToken || !signature) {
      await recordPaymentFailure(analysisId, orderId, "잘못된 결제 정보입니다.", "MISSING_PARAMS", tid);
      return NextResponse.redirect(`${redirectUrl}?error=${encodeURIComponent("잘못된 결제 정보입니다.")}`, 302);
    }

    const amount = parseInt(amountStr, 10);
    const secretKey = (process.env.NICEPAY_SECRET_KEY || "").trim();

    // 1. Verify Signature
    const expectedStr = authToken + clientId + amountStr + secretKey;
    const expectedSignature = crypto.createHash("sha256").update(expectedStr).digest("hex");

    if (signature !== expectedSignature) {
      console.warn(`[PAYMENT] Signature mismatch for order: ${orderId}`);
      await recordPaymentFailure(analysisId, orderId, "결제 서명 검증에 실패했습니다.", "SIGNATURE_MISMATCH", tid);
      return NextResponse.redirect(`${redirectUrl}?error=${encodeURIComponent("결제 서명 검증에 실패했습니다.")}`, 302);
    }

    // 2. Fetch analysis to verify order and idempotency
    const { data: analysisData, error: analysisError } = await supabaseAdmin
      .from("analyses")
      .select("status, premium_status, primary_type, extracted_signals")
      .eq("id", analysisId)
      .single();

    if (analysisError || !analysisData) {
      console.error(`[PAYMENT] Analysis not found: ${analysisId}`);
      return NextResponse.redirect(`${redirectUrl}?error=${encodeURIComponent("분석 결과를 찾을 수 없습니다.")}`, 302);
    }

    const storedPayment = analysisData.status?.payment;
    if (!storedPayment || storedPayment.order_id !== orderId) {
      console.error(`[PAYMENT] Order ID mismatch or not found: ${orderId}`);
      return NextResponse.redirect(`${redirectUrl}?error=${encodeURIComponent("유효하지 않은 결제 요청입니다.")}`, 302);
    }

    const orderType: "report" | "chat_topup" =
      storedPayment.order_type === "chat_topup" ? "chat_topup" : "report";

    // Idempotency check
    if (orderType === "report" && analysisData.premium_status === "paid") {
      console.log(`[PAYMENT] Order ${orderId} already paid.`);
      return NextResponse.redirect(redirectUrl, 302);
    }
    if (orderType === "chat_topup" && storedPayment.payment_status === "paid") {
      console.log(`[PAYMENT] Topup order ${orderId} already paid.`);
      return NextResponse.redirect(`${redirectUrl}?topup=success`, 302);
    }

    if (storedPayment.amount !== amount) {
      console.error(`[PAYMENT] Amount mismatch: stored ${storedPayment.amount}, requested ${amount}`);
      return NextResponse.redirect(`${redirectUrl}?error=${encodeURIComponent("결제 금액이 일치하지 않습니다.")}`, 302);
    }

    // 3. Server Approval API
    console.log(`[PAYMENT] approval requested for tid: ${tid}`);

    const nicepayEnv = process.env.NICEPAY_ENV || "production";
    const apiUrl =
      nicepayEnv === "sandbox" ? "https://sandbox-api.nicepay.co.kr" : "https://api.nicepay.co.kr";
    const authHeader = `Basic ${Buffer.from(`${clientId}:${secretKey}`).toString("base64")}`;

    const approvalRes = await fetch(`${apiUrl}/v1/payments/${tid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ amount }),
    });

    const approvalData = await approvalRes.json();

    if (!approvalRes.ok || approvalData.resultCode !== "0000") {
      console.error(`[PAYMENT] approval failed: ${approvalData.resultMsg}`);
      await recordPaymentFailure(
        analysisId,
        orderId,
        approvalData.resultMsg || "결제 승인 실패",
        approvalData.resultCode,
        tid
      );
      return NextResponse.redirect(
        `${redirectUrl}?error=${encodeURIComponent(approvalData.resultMsg || "결제 승인에 실패했습니다.")}`,
        302
      );
    }

    console.log(`[PAYMENT] approval succeeded for order: ${orderId} (${orderType})`);

    const purchasedAt = new Date();
    const existingChat = analysisData.status?.chat || {
      remaining_turns: 0,
      total_used: 0,
      messages: [],
    };

    if (orderType === "chat_topup") {
      const updatedChat = {
        ...existingChat,
        remaining_turns: (existingChat.remaining_turns || 0) + PRICING.CHAT_TOPUP.turnsToAdd,
        updated_at: purchasedAt.toISOString(),
      };

      const paidStatus = {
        ...(analysisData.status || {}),
        chat: updatedChat,
        payment: {
          ...storedPayment,
          tid,
          payment_status: "paid",
          paid_at: purchasedAt.toISOString(),
        },
      };

      const { error: updateError } = await supabaseAdmin
        .from("analyses")
        .update({ status: paidStatus })
        .eq("id", analysisId);

      if (updateError) {
        console.error("[PAYMENT] chat_topup update failed:", updateError);
        return NextResponse.redirect(
          `${redirectUrl}?error=${encodeURIComponent("질문권 충전에 실패했습니다. 고객센터로 문의해주세요.")}`,
          302
        );
      }

      try {
        await notifyPaidConversion({
          id: analysisId,
          amount,
          targetSpeaker: `${analysisData.extracted_signals?.target_speaker_label || "상대방"} (AI질문권 추가)`,
          primaryType: analysisData.primary_type,
          orderId,
        });
      } catch (telegramErr) {
        console.error("[TELEGRAM] Failed to dispatch topup alert:", telegramErr);
      }

      return NextResponse.redirect(`${redirectUrl}?topup=success#ai-counseling`, 302);
    }

    // 4. Main Report Purchase: generate 43-char access token + random 4-digit PIN
    const expiresAt = new Date(purchasedAt);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const reportToken = crypto.randomBytes(32).toString("base64url");
    const reportTokenHash = hashToken(reportToken);
    const pin = String(crypto.randomInt(1000, 10000));
    const pinHash = hashToken(pin);
    const buyerTel: string = storedPayment.buyer_tel || "";

    const paidStatus = {
      ...(analysisData.status || {}),
      access: {
        buyer_tel: buyerTel,
        pin_hash: pinHash,
        issued_at: purchasedAt.toISOString(),
      },
      chat: {
        remaining_turns: PRICING.REPORT.initialChatTurns,
        total_used: existingChat.total_used || 0,
        messages: existingChat.messages || [],
        created_at: existingChat.created_at || purchasedAt.toISOString(),
        updated_at: purchasedAt.toISOString(),
      },
      payment: {
        ...storedPayment,
        tid,
        payment_status: "paid",
        paid_at: purchasedAt.toISOString(),
      },
    };

    const { error: updateError } = await supabaseAdmin
      .from("analyses")
      .update({
        premium_unlocked: true,
        premium_status: "paid",
        purchased_at: purchasedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        report_access_token_hash: reportTokenHash,
        status: paidStatus,
      })
      .eq("id", analysisId);

    if (updateError) {
      console.error(`[PAYMENT] supabase update failed:`, updateError);
      return NextResponse.redirect(
        `${redirectUrl}?error=${encodeURIComponent("결제 정보 저장에 실패했습니다. 고객센터로 문의해주세요.")}`,
        302
      );
    }

    console.log(`[PAYMENT] premium unlocked for analysis: ${analysisId}`);

    // Dispatch Solapi SMS/AlimTalk with Report URL + 4-digit PIN
    if (buyerTel) {
      const reportUrl = `${siteUrl}/report/${reportToken}`;
      const smsResult = await sendReportAccessNotification({
        to: buyerTel,
        reportUrl,
        pin,
      });
      console.log(`[SOLAPI] dispatch result for ${analysisId}:`, smsResult);
    }

    // Realtime Telegram Notification for Paid Conversion
    try {
      await notifyPaidConversion({
        id: analysisId,
        amount,
        targetSpeaker: analysisData.extracted_signals?.target_speaker_label,
        primaryType: analysisData.primary_type,
        orderId,
      });
    } catch (telegramErr) {
      console.error("[TELEGRAM] Failed to dispatch paid conversion alert:", telegramErr);
    }

    const response = NextResponse.redirect(`${redirectUrl}?paid=1`, 302);
    response.cookies.set(`avoidance_pin_verified_${analysisId}`, pinHash, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    return response;
  } catch (error: any) {
    console.error("Premium Callback POST Error:", error);
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
    return NextResponse.redirect(
      `${siteUrl}/?error=${encodeURIComponent("결제 처리 중 서버 오류가 발생했습니다.")}`,
      302
    );
  }
}
