import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin, generateOwnerToken, hashToken } from "@/lib/supabase/server";
import {
  sendReportAccessNotification,
  normalizePhoneNumber,
  isValidKoreanPhone,
} from "@/lib/solapi/notify";

function generateRandom4DigitPin(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return String(n);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const buyerTel = normalizePhoneNumber(typeof body?.buyerTel === "string" ? body.buyerTel : "");

    if (!isValidKoreanPhone(buyerTel)) {
      return NextResponse.json(
        { error: "올바른 휴대폰 번호(010...)를 입력해주세요." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const ownerToken = cookieStore.get("avoidance_owner_token")?.value;
    const pinVerifiedHash = cookieStore.get(`avoidance_pin_verified_${id}`)?.value;

    const { data: row, error: fetchError } = await supabaseAdmin
      .from("analyses")
      .select("id, owner_token_hash, premium_unlocked, status")
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
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
    }

    if (!row.premium_unlocked) {
      return NextResponse.json({ error: "결제 완료 후 이용할 수 있습니다." }, { status: 403 });
    }

    const rawReportToken = generateOwnerToken();
    const reportTokenHash = hashToken(rawReportToken);
    const pin = generateRandom4DigitPin();
    const pinHash = hashToken(pin);
    const nowIso = new Date().toISOString();

    const updatedStatus = {
      ...(row.status || {}),
      access: {
        ...(row.status?.access || {}),
        pin_hash: pinHash,
        buyer_tel: buyerTel,
        issued_at: nowIso,
      },
    };

    const { error: updateError } = await supabaseAdmin
      .from("analyses")
      .update({
        report_token_hash: reportTokenHash,
        status: updatedStatus,
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: "링크 발급 저장에 실패했습니다." }, { status: 500 });
    }

    const siteOrigin = (process.env.NEXT_PUBLIC_SITE_URL || "https://lovepattern.site").replace(/\/+$/, "");
    const reportUrl = `${siteOrigin}/report/${rawReportToken}`;

    const notifyRes = await sendReportAccessNotification({
      to: buyerTel,
      reportUrl,
      pin,
    });

    const response = NextResponse.json({
      success: true,
      sent: notifyRes.sent,
      reason: notifyRes.reason,
      reportUrl,
    });

    response.cookies.set(`avoidance_pin_verified_${id}`, pinHash, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Send Access POST Error:", err);
    return NextResponse.json({ error: "알림톡 발송 중 오류가 발생했습니다." }, { status: 500 });
  }
}
