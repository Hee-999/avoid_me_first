import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin, hashToken } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    // 1. Validate Owner
    const cookieStore = await cookies();
    const ownerToken = cookieStore.get("avoidance_owner_token")?.value;

    if (!ownerToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ownerTokenHash = hashToken(ownerToken);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("dummy")) {
      return NextResponse.json({ report_token: "dummy-report-token" });
    }

    // 2. Fetch analysis to verify ownership and premium status
    const { data: analysis, error: fetchError } = await supabaseAdmin
      .from("analyses")
      .select("owner_token_hash, premium_unlocked")
      .eq("id", id)
      .single();

    if (fetchError || !analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    if (analysis.owner_token_hash !== ownerTokenHash) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!analysis.premium_unlocked) {
      return NextResponse.json({ error: "Premium report is not unlocked" }, { status: 403 });
    }

    // 3. Generate Secure Token and Hash
    const crypto = require("crypto");
    const reportToken = crypto.randomBytes(32).toString("base64url");
    const reportTokenHash = hashToken(reportToken);
      
    const { error: updateError } = await supabaseAdmin
      .from("analyses")
      .update({ 
        report_access_token_hash: reportTokenHash
      })
      .eq("id", id);
      
    if (updateError) {
      return NextResponse.json({ error: "Failed to create archive link" }, { status: 500 });
    }

    return NextResponse.json({ report_token: reportToken });

  } catch (error) {
    console.error("Report Archive POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
