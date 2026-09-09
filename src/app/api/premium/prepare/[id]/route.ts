import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AnalysisRepository } from "@/lib/repository/analysisRepository";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // 1. Extract cookie
    const cookieStore = await cookies();
    const ownerToken = cookieStore.get("avoidance_owner_token")?.value;

    if (!ownerToken) {
      return NextResponse.json({ error: "Unauthorized. No owner token found." }, { status: 401 });
    }

    // 2. Fetch using Repository (validates owner)
    let analysis;
    try {
      const result = await AnalysisRepository.getAnalysisForOwner(id, ownerToken);
      analysis = result.analysis;
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }

    if (analysis.premium_unlocked) {
      return NextResponse.json({ error: "Already unlocked." }, { status: 400 });
    }

    // 3. Create a unique orderId
    const amount = 2900;
    const goodsName = "프리미엄 관계 심층 리포트";
    const orderId = `${id}_${Date.now()}`;

    // 4. Update the DB status with the pending payment
    const newStatus = {
      ...(analysis.status || {}),
      payment: {
        order_id: orderId,
        amount: amount,
        payment_status: "pending",
        created_at: new Date().toISOString()
      }
    };

    const { error } = await supabaseAdmin
      .from("analyses")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      throw new Error("Failed to update status for pending payment");
    }

    console.log(`[PAYMENT] request created: ${orderId}`);

    return NextResponse.json({
      orderId,
      amount,
      goodsName
    });

  } catch (error) {
    console.error("Premium Prepare POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
