import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin, hashToken, generateShareId } from "@/lib/supabase/server";

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
      return NextResponse.json({ share_id: "dummy-share-id" });
    }

    // 2. Fetch analysis to verify ownership
    const { data: analysis, error: fetchError } = await supabaseAdmin
      .from("analyses")
      .select("owner_token_hash, share_id, share_enabled")
      .eq("id", id)
      .single();

    if (fetchError || !analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    if (analysis.owner_token_hash !== ownerTokenHash) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 3. Enable sharing
    let shareId = analysis.share_id;
    
    if (!analysis.share_enabled || !shareId) {
      shareId = shareId || generateShareId();
      
      const { error: updateError } = await supabaseAdmin
        .from("analyses")
        .update({ share_enabled: true, share_id: shareId })
        .eq("id", id);
        
      if (updateError) {
        return NextResponse.json({ error: "Failed to enable sharing" }, { status: 500 });
      }
    }

    return NextResponse.json({ share_id: shareId });

  } catch (error) {
    console.error("Share POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
