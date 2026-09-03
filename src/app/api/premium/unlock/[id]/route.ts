import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("dummy")) {
      return NextResponse.json({ success: true, message: "Mock unlock successful" });
    }

    // In a real scenario, this endpoint would be called by a Webhook from PG (Payment Gateway)
    // Here we just blindly unlock it for demonstration or temporary UI override
    const { error } = await supabaseAdmin
      .from("analyses")
      .update({ premium_unlocked: true, premium_status: "paid" })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to unlock premium" }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Premium Unlock POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
