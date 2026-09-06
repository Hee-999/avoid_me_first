import { NextResponse } from "next/server";
import { supabaseAdmin, hashToken } from "@/lib/supabase/server";

export async function GET(request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const { token: reportToken } = await context.params;
    const reportTokenHash = hashToken(reportToken);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("dummy")) {
      return NextResponse.json({
        premium_report: null, // Should have mock report data if needed, but error for now to avoid mock logic complexity
        error: "Mock environment does not support premium reports",
      }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
      .from("analyses")
      .select("premium_report, expires_at")
      .eq("report_access_token_hash", reportTokenHash)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check expiry
    const now = new Date();
    const expiresAt = new Date(data.expires_at);
    if (now > expiresAt) {
      return NextResponse.json({ error: "Report expired" }, { status: 410 }); // 410 Gone
    }

    if (!data.premium_report) {
      return NextResponse.json({ error: "Report not ready or missing" }, { status: 404 });
    }

    // Return the premium report data
    return NextResponse.json({
      premium_report: data.premium_report
    });

  } catch (error) {
    console.error("Public Report GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
