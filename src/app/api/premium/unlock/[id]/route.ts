import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { notifyPaidConversion } from "@/lib/telegram/notify";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

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

    const { error } = await supabaseAdmin
      .from("analyses")
      .update({ 
        premium_unlocked: true, 
        premium_status: "paid",
        purchased_at: purchasedAt.toISOString(),
        expires_at: expiresAt.toISOString()
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to unlock premium" }, { status: 500 });
    }

    try {
      await notifyPaidConversion({
        id,
        amount: 4900,
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
