import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin, hashToken } from "@/lib/supabase/server";

export async function GET(request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const { token: reportToken } = await context.params;
    const reportTokenHash = hashToken(reportToken);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("dummy")) {
      return NextResponse.json(
        {
          premium_report: null,
          error: "Mock environment does not support premium reports",
        },
        { status: 404 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("analyses")
      .select(
        "id, owner_token_hash, premium_report, derived_context, extracted_signals, primary_type, secondary_type, anxiety_score, avoidance_score, secure_fit, preoccupied_fit, dismissive_fit, fearful_fit, status, expires_at"
      )
      .eq("report_access_token_hash", reportTokenHash)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check expiry
    const now = new Date();
    const expiresAt = new Date(data.expires_at);
    if (now > expiresAt) {
      return NextResponse.json({ error: "Report expired" }, { status: 410 });
    }

    // Check PIN / Owner verification if PIN protection is active
    const pinHash = data.status?.access?.pin_hash;
    if (pinHash) {
      const cookieStore = await cookies();
      const ownerToken = cookieStore.get("avoidance_owner_token")?.value;
      const pinCookie = cookieStore.get(`avoidance_pin_verified_${data.id}`)?.value;

      const isOwner = Boolean(ownerToken && hashToken(ownerToken) === data.owner_token_hash);
      const isPinVerified = Boolean(pinCookie && pinCookie === pinHash);

      if (!isOwner && !isPinVerified) {
        return NextResponse.json({
          requires_pin: true,
          analysis_id: data.id,
        });
      }
    }

    if (!data.premium_report) {
      return NextResponse.json({ error: "Report not ready or missing" }, { status: 404 });
    }

    return NextResponse.json({
      requires_pin: false,
      analysis_id: data.id,
      premium_report: data.premium_report,
      derived_context: data.derived_context || null,
      target_speaker_label: data.extracted_signals?.target_speaker_label || "상대방",
      primary_type: data.primary_type,
      secondary_type: data.secondary_type,
      attachment_dimensions: {
        anxiety: data.anxiety_score,
        avoidance: data.avoidance_score,
      },
      attachment_fitness: {
        secure: data.secure_fit,
        preoccupied: data.preoccupied_fit,
        dismissing: data.dismissive_fit,
        fearful: data.fearful_fit,
      },
      chat: data.status?.chat || { remaining_turns: 0, total_used: 0, messages: [] },
    });
  } catch (error) {
    console.error("Public Report GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
