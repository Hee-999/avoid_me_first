import { NextResponse } from "next/server";
import { AnalysisRepository } from "@/lib/repository/analysisRepository";
import { generatePremiumReport } from "@/lib/report/premium/generator";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing analysis ID" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("analyses")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    if (!data.derived_context) {
      return NextResponse.json({ error: "Derived context not found for analysis" }, { status: 400 });
    }

    const mvpResult = {
      version: data.analysis_version || "mvp-scoring-v2.0",
      dimensions: data.extracted_signals?.dimensions || {
        anxiety: { score: data.anxiety_score, evaluable: data.primary_type === "unclear" ? 0 : 1, status: data.primary_type === "unclear" ? "insufficient" : "low_coverage" },
        avoidance: { score: data.avoidance_score, evaluable: data.primary_type === "unclear" ? 0 : 1, status: data.primary_type === "unclear" ? "insufficient" : "low_coverage" }
      },
      fitness: {
        secure: data.secure_fit,
        preoccupied: data.preoccupied_fit,
        dismissing: data.dismissive_fit,
        fearful: data.fearful_fit,
      },
      primary_type: data.primary_type,
      secondary_type: data.secondary_type,
      signals: data.extracted_signals,
    };

    console.log(`[PREMIUM RETRY] Starting report re-generation for analysis: ${id}`);
    const targetLabel = data.extracted_signals?.target_speaker_label || "상대방";
    const premiumReport = await generatePremiumReport(mvpResult as any, data.derived_context, targetLabel);
    await AnalysisRepository.updatePremiumReport(id, premiumReport, "ready");

    return NextResponse.json({ success: true, status: "ready" });
  } catch (err: any) {
    console.error(`[PREMIUM RETRY] Failed to re-generate report:`, err);
    return NextResponse.json({ error: err.message || "Failed to regenerate report" }, { status: 500 });
  }
}
