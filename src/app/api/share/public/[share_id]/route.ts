import { NextResponse } from "next/server";
import { supabaseAdmin, hashToken } from "@/lib/supabase/server";

export async function GET(request: Request, context: { params: Promise<{ share_id: string }> }) {
  try {
    const { share_id: shareToken } = await context.params;
    const shareTokenHash = hashToken(shareToken);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("dummy")) {
      return NextResponse.json({
        share_alias: "상대방",
        analysis_mode: "reunion",
        v3_metrics: {
          my_temperature: 74,
          partner_temperature: 48,
          temperature_gap: 26,
          reunion_or_flirt_probability: 64,
          backfire_probability: 72,
          one_line_summary: "대화 주도권과 감정 표현의 온도차가 벌어져 있어, 성급한 추궁보다 가벼운 호흡 조절이 필요한 흐름입니다."
        },
        primary_type: "거부-회피형 (Dismissive-Avoidant)",
        secondary_type: "안정형 (Secure)",
        attachment_fitness: {
          secure: 40, preoccupied: 10, dismissing: 85, fearful: 20
        },
        attachment_dimensions: {
          anxiety: 10, avoidance: 90
        }
      });
    }

    const { data, error } = await supabaseAdmin
      .from("analyses")
      .select("share_alias, primary_type, secondary_type, secure_fit, preoccupied_fit, dismissive_fit, fearful_fit, anxiety_score, avoidance_score, extracted_signals, derived_context")
      .eq("share_token_hash", shareTokenHash)
      .eq("share_enabled", true)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Shared analysis not found or not public" }, { status: 404 });
    }

    const anxiety = data.anxiety_score ?? 0;
    const avoidance = data.avoidance_score ?? 0;
    const secureFit = data.secure_fit ?? 50;
    const analysisMode = data.derived_context?.analysis_mode === "flirting" ? "flirting" : "reunion";

    const fallbackMyTemp = Math.min(92, Math.max(48, Math.round(58 + anxiety * 0.32)));
    const fallbackPartnerTemp = Math.min(88, Math.max(24, Math.round(74 - avoidance * 0.45)));
    const v3Metrics = data.derived_context?.v3_metrics || {
      my_temperature: fallbackMyTemp,
      partner_temperature: fallbackPartnerTemp,
      temperature_gap: Math.abs(fallbackMyTemp - fallbackPartnerTemp),
      reunion_or_flirt_probability: Math.min(89, Math.max(31, Math.round(secureFit * 0.55 + (100 - avoidance) * 0.35))),
      backfire_probability: Math.min(88, Math.max(35, Math.round(42 + avoidance * 0.42))),
      one_line_summary:
        analysisMode === "flirting"
          ? `${data.share_alias || "상대방"}님은 호감과 조심스러움이 공존하는 흐름으로, 부담 없는 템포 조절이 중요한 시점입니다.`
          : `${data.share_alias || "상대방"}님은 감정 과부하 시 한 발 물러서는 방어 패턴이 관찰되어, 여유 있는 접근이 유리합니다.`,
    };

    // Public Projection (Only Safe Summary Data — No Chat Logs or 1:1 Counseling)
    const publicData = {
      share_alias: data.share_alias || "상대방",
      analysis_mode: analysisMode,
      v3_metrics: v3Metrics,
      primary_type: data.primary_type,
      secondary_type: data.secondary_type,
      attachment_fitness: {
        secure: data.secure_fit,
        preoccupied: data.preoccupied_fit,
        dismissing: data.dismissive_fit,
        fearful: data.fearful_fit
      },
      attachment_dimensions: {
        anxiety: data.anxiety_score,
        avoidance: data.avoidance_score,
        anxiety_status: data.extracted_signals?.dimensions?.anxiety?.status || (
          (data.extracted_signals?.AN01?.v === null && data.extracted_signals?.AN02?.v === null && data.extracted_signals?.AN03?.v === null) ? "insufficient" : "ok"
        ),
        avoidance_status: data.extracted_signals?.dimensions?.avoidance?.status || (
          (data.extracted_signals?.AV02?.v === null && data.extracted_signals?.AV03?.v === null && data.extracted_signals?.AV04?.v === null && data.extracted_signals?.AV05?.v === null) ? "insufficient" : "ok"
        )
      }
    };

    return NextResponse.json(publicData);

  } catch (error) {
    console.error("Public Share GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
