import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AnalysisRepository } from "@/lib/repository/analysisRepository";
import { supabaseAdmin, hashToken } from "@/lib/supabase/server";
import { PRICING } from "@/config/pricing";
import { isValidKoreanPhone, normalizePhoneNumber } from "@/lib/solapi/notify";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json().catch(() => ({}));
    const orderType: "report" | "chat_topup" = body?.orderType === "chat_topup" ? "chat_topup" : "report";
    const buyerTelRaw = typeof body?.buyerTel === "string" ? body.buyerTel : "";
    const normalizedTel = normalizePhoneNumber(buyerTelRaw);

    // 1. Validate caller ownership (via owner cookie OR pin-verified cookie)
    const cookieStore = await cookies();
    const ownerToken = cookieStore.get("avoidance_owner_token")?.value;
    const pinVerifiedCookie = cookieStore.get(`avoidance_pin_verified_${id}`)?.value;

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
      pinVerifiedCookie &&
      row.status?.access?.pin_hash &&
      pinVerifiedCookie === row.status.access.pin_hash
    );

    if (!isOwnerByToken && !isOwnerByPin) {
      // Fallback to mock check if dummy env
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("dummy")) {
        await AnalysisRepository.getAnalysisForOwner(id, ownerToken || "dummy");
      } else {
        return NextResponse.json({ error: "Unauthorized. No valid session found." }, { status: 401 });
      }
    }

    if (orderType === "report") {
      if (row.premium_unlocked) {
        return NextResponse.json({ error: "이미 잠금 해제된 리포트입니다." }, { status: 400 });
      }
      if (!isValidKoreanPhone(normalizedTel)) {
        return NextResponse.json(
          { error: "리포트 전용 링크와 열람 PIN을 받을 올바른 휴대폰 번호를 입력해주세요." },
          { status: 400 }
        );
      }
    } else {
      if (!row.premium_unlocked) {
        return NextResponse.json(
          { error: "먼저 심층 리포트를 잠금 해제한 후 추가 질문권을 구매할 수 있습니다." },
          { status: 400 }
        );
      }
    }

    const amount = orderType === "chat_topup" ? PRICING.CHAT_TOPUP.salePrice : PRICING.REPORT.salePrice;
    const goodsName = orderType === "chat_topup" ? PRICING.CHAT_TOPUP.shortName : PRICING.REPORT.shortName;
    const orderId = `${id}_${Date.now()}`;

    const newStatus = {
      ...(row.status || {}),
      payment: {
        order_id: orderId,
        order_type: orderType,
        amount,
        ...(orderType === "report" ? { buyer_tel: normalizedTel } : {}),
        payment_status: "pending",
        created_at: new Date().toISOString(),
      },
    };

    const { error: updateError } = await supabaseAdmin
      .from("analyses")
      .update({ status: newStatus })
      .eq("id", id);

    if (updateError) {
      throw new Error("Failed to update status for pending payment");
    }

    console.log(`[PAYMENT] request created: ${orderId} (${orderType}, ${amount}원)`);

    return NextResponse.json({
      orderId,
      amount,
      goodsName,
      buyerTel: normalizedTel || row.status?.access?.buyer_tel || undefined,
    });
  } catch (error) {
    console.error("Premium Prepare POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
