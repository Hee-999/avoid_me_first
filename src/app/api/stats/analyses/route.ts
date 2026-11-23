import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { count, error } = await supabaseAdmin
      .from("analyses")
      .select("id", { count: "exact", head: true });

    if (error) {
      console.error("[STATS] Failed to count analyses:", error);
      return NextResponse.json({ totalCount: 194 }, { status: 200 });
    }

    return NextResponse.json(
      { totalCount: count ?? 194 },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("[STATS] Unexpected error:", err);
    return NextResponse.json({ totalCount: 194 }, { status: 200 });
  }
}
