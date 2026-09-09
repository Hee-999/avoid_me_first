import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import crypto from "crypto";

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
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/result/${analysisId}`;

    if (authResultCode !== "0000") {
      console.warn(`[PAYMENT] Auth failed: ${authResultMsg}`);
      // Return 302 redirect so the user browser navigates back to the result page with an error
      return NextResponse.redirect(`${redirectUrl}?error=${encodeURIComponent(authResultMsg || "결제 인증 실패")}`, 302);
    }

    if (!tid || !clientId || !amountStr || !authToken || !signature) {
      return NextResponse.redirect(`${redirectUrl}?error=${encodeURIComponent("잘못된 결제 정보입니다.")}`, 302);
    }

    const amount = parseInt(amountStr, 10);
    const secretKey = process.env.NICEPAY_SECRET_KEY || "";

    // 1. Verify Signature
    const expectedStr = authToken + clientId + amountStr + secretKey;
    const expectedSignature = crypto.createHash('sha256').update(expectedStr).digest('hex');

    if (signature !== expectedSignature) {
      console.warn(`[PAYMENT] Signature mismatch for order: ${orderId}`);
      return NextResponse.redirect(`${redirectUrl}?error=${encodeURIComponent("결제 서명 검증에 실패했습니다.")}`, 302);
    }

    // 2. Fetch analysis to verify order and idempotency
    const { data: analysisData, error: analysisError } = await supabaseAdmin
      .from("analyses")
      .select("status, premium_status")
      .eq("id", analysisId)
      .single();

    if (analysisError || !analysisData) {
      console.error(`[PAYMENT] Analysis not found: ${analysisId}`);
      return NextResponse.redirect(`${redirectUrl}?error=${encodeURIComponent("분석 결과를 찾을 수 없습니다.")}`, 302);
    }

    // Idempotency check
    if (analysisData.premium_status === "paid") {
      console.log(`[PAYMENT] Order ${orderId} already paid.`);
      return NextResponse.redirect(redirectUrl, 302);
    }

    const storedPayment = analysisData.status?.payment;
    if (!storedPayment || storedPayment.order_id !== orderId) {
      console.error(`[PAYMENT] Order ID mismatch or not found: ${orderId}`);
      return NextResponse.redirect(`${redirectUrl}?error=${encodeURIComponent("유효하지 않은 결제 요청입니다.")}`, 302);
    }

    if (storedPayment.amount !== amount) {
      console.error(`[PAYMENT] Amount mismatch: stored ${storedPayment.amount}, requested ${amount}`);
      return NextResponse.redirect(`${redirectUrl}?error=${encodeURIComponent("결제 금액이 일치하지 않습니다.")}`, 302);
    }

    // 3. Server Approval API
    console.log(`[PAYMENT] approval requested for tid: ${tid}`);
    
    const nicepayEnv = process.env.NICEPAY_ENV || "production";
    const apiUrl = nicepayEnv === "sandbox" 
      ? "https://sandbox-api.nicepay.co.kr" 
      : "https://api.nicepay.co.kr";
    const authHeader = `Basic ${Buffer.from(`${clientId}:${secretKey}`).toString('base64')}`;

    const approvalRes = await fetch(`${apiUrl}/v1/payments/${tid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader
      },
      body: JSON.stringify({ amount })
    });

    const approvalData = await approvalRes.json();

    if (!approvalRes.ok || approvalData.resultCode !== "0000") {
      console.error(`[PAYMENT] approval failed: ${approvalData.resultMsg}`);
      
      // Update DB with failed status
      const failedStatus = {
        ...(analysisData.status || {}),
        payment: {
          ...storedPayment,
          tid,
          payment_status: "failed",
          error_message: approvalData.resultMsg
        }
      };
      await supabaseAdmin.from("analyses").update({ status: failedStatus }).eq("id", analysisId);

      return NextResponse.redirect(`${redirectUrl}?error=${encodeURIComponent(approvalData.resultMsg || "결제 승인에 실패했습니다.")}`, 302);
    }

    console.log(`[PAYMENT] approval succeeded for order: ${orderId}`);

    // 4. Update Supabase as Paid
    const purchasedAt = new Date();
    const expiresAt = new Date(purchasedAt);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const paidStatus = {
      ...(analysisData.status || {}),
      payment: {
        ...storedPayment,
        tid,
        payment_status: "paid",
        paid_at: purchasedAt.toISOString()
      }
    };

    const { error: updateError } = await supabaseAdmin
      .from("analyses")
      .update({
        premium_unlocked: true,
        premium_status: "paid",
        purchased_at: purchasedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        status: paidStatus
      })
      .eq("id", analysisId);

    if (updateError) {
      console.error(`[PAYMENT] supabase updated failed:`, updateError);
      return NextResponse.redirect(`${redirectUrl}?error=${encodeURIComponent("결제 정보 저장에 실패했습니다. 고객센터로 문의해주세요.")}`, 302);
    }

    console.log(`[PAYMENT] premium unlocked for analysis: ${analysisId}`);

    // 5. Redirect back to result page
    return NextResponse.redirect(redirectUrl, 302);

  } catch (error: any) {
    console.error("Premium Callback POST Error:", error);
    // Best effort redirect
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    return NextResponse.redirect(`${siteUrl}/?error=${encodeURIComponent("결제 처리 중 서버 오류가 발생했습니다.")}`, 302);
  }
}
