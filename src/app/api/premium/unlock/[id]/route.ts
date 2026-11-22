import { NextResponse } from "next/server";
import { supabaseAdmin, generateOwnerToken, hashToken } from "@/lib/supabase/server";
import { notifyPaidConversion } from "@/lib/telegram/notify";
import { PRICING } from "@/config/pricing";
import {
  sendReportAccessNotification,
  normalizePhoneNumber,
  isValidKoreanPhone,
} from "@/lib/solapi/notify";

function generateRandom4DigitPin(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return String(n);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json().catch(() => ({}));
    const rawBuyerTel = typeof body?.buyerTel === "string" ? body.buyerTel : "";
    const buyerTel = normalizePhoneNumber(rawBuyerTel);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("dummy")) {
      return NextResponse.json({ success: true, message: "Mock unlock successful" });
    }

    // 보안 검증: 로컬 개발 환경(NODE_ENV !== 'production')이거나, 올바른 관리자 키가 있는 경우만 허용
    const isDev = process.env.NODE_ENV !== "production";
    const { searchParams } = new URL(request.url);
    const providedSecret = searchParams.get("secret") || request.headers.get("x-admin-secret");
    const configuredSecret = process.env.MONITOR_SECRET;
    const isAuthorizedAdmin = !!providedSecret && !!configuredSecret && providedSecret === configuredSecret;

    if (!isDev && !isAuthorizedAdmin) {
      console.warn(`[SECURITY] Unauthorized unlock attempt for id: ${id}`);
      return NextResponse.json(
        { error: "Forbidden: 테스트 언락은 로컬 개발 환경 또는 관리자 인증 시에만 가능합니다." },
        { status: 403 }
      );
    }
    const purchasedAt = new Date();
    const expiresAt = new Date(purchasedAt);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const { data: existingRow } = await supabaseAdmin
      .from("analyses")
      .select("status")
      .eq("id", id)
      .single();

    const existingStatus = existingRow?.status || {};
    const existingChat = existingStatus.chat;
    const resetChat = searchParams.get("resetChat") === "1";

    // 테스트 언락 시에도 전화번호를 입력했으면 전용 토큰 + 4자리 PIN 발급 및 솔라피 알림톡 발송까지 동일하게 수행
    const rawReportToken = generateOwnerToken();
    const reportTokenHash = hashToken(rawReportToken);
    const pin = generateRandom4DigitPin();
    const pinHash = hashToken(pin);

    const updatedStatus = {
      ...existingStatus,
      ...(buyerTel && isValidKoreanPhone(buyerTel)
        ? {
            access: {
              pin_hash: pinHash,
              buyer_tel: buyerTel,
              issued_at: purchasedAt.toISOString(),
            },
          }
        : {}),
      chat: !resetChat && existingChat
        ? existingChat
        : {
            remaining_turns: PRICING.REPORT.initialChatTurns,
            total_used: 0,
            messages: [],
            created_at: purchasedAt.toISOString(),
          },
    };

    const { error } = await supabaseAdmin
      .from("analyses")
      .update({ 
        premium_unlocked: true, 
        premium_status: "paid",
        ...(buyerTel && isValidKoreanPhone(buyerTel) ? { report_token_hash: reportTokenHash } : {}),
        purchased_at: purchasedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        status: updatedStatus,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to unlock premium" }, { status: 500 });
    }

    if (buyerTel && isValidKoreanPhone(buyerTel)) {
      const siteOrigin = (process.env.NEXT_PUBLIC_SITE_URL || "https://lovepattern.site").replace(/\/+$/, "");
      const reportUrl = `${siteOrigin}/report/${rawReportToken}`;
      await sendReportAccessNotification({
        to: buyerTel,
        reportUrl,
        pin,
      }).catch((err) => console.error("[SOLAPI TEST UNLOCK] Error:", err));
    }

    try {
      await notifyPaidConversion({
        id,
        amount: PRICING.REPORT.salePrice,
        orderId: `DIRECT_UNLOCK_${id.slice(0, 8)}`,
      });
    } catch (telegramErr) {
      console.error("[TELEGRAM] Failed to dispatch paid conversion alert:", telegramErr);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Premium Unlock POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
