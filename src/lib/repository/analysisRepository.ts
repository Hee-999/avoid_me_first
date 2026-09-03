import { supabaseAdmin, hashToken } from "@/lib/supabase/server";
import { sanitizeAnalysisForPersistence } from "../privacy/sanitizer";

export class AnalysisRepository {
  /**
   * Saves the analysis result after sanitizing it.
   */
  static async saveAnalysisResult(payload: any, ownerTokenHash: string): Promise<string> {
    const sanitizedPayload = sanitizeAnalysisForPersistence(payload);
    let analysisId = crypto.randomUUID();

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("dummy")) {
      console.warn("Using dummy Supabase credentials. Bypassing actual DB insert.");
      return analysisId;
    }

    const { data, error } = await supabaseAdmin
      .from("analyses")
      .insert({
        id: analysisId,
        owner_token_hash: ownerTokenHash,
        status: sanitizedPayload.status || { scoring: "completed", report: "completed" },
        
        // Mapped dimensions for MVP v2.0
        anxiety_score: sanitizedPayload.dimensions?.anxiety?.score ?? 0,
        avoidance_score: sanitizedPayload.dimensions?.avoidance?.score ?? 0,
        
        // Mapped fitness for MVP v2.0
        secure_fit: sanitizedPayload.fitness?.secure ?? 0,
        preoccupied_fit: sanitizedPayload.fitness?.preoccupied ?? 0,
        dismissive_fit: sanitizedPayload.fitness?.dismissing ?? 0,
        fearful_fit: sanitizedPayload.fitness?.fearful ?? 0,
        
        primary_type: sanitizedPayload.primary_type ?? "secure",
        secondary_type: sanitizedPayload.secondary_type ?? null,
        
        // Save the full structured JSON so we have access to dimensions coverage, signals, etc.
        extracted_signals: {
          ...(sanitizedPayload.signals || {}),
          target_speaker_label: sanitizedPayload.target_speaker_label
        },
        
        // Save derived context so we can generate the premium report later without raw text
        derived_context: sanitizedPayload.derived_context || null,
        
        // Store premium report as JSON
        premium_report: sanitizedPayload.premium_report || null,
        
        analysis_version: "mvp-scoring-v2.0",
        report_version: "premium-report-v2.0",
        
        premium_unlocked: sanitizedPayload.access?.premium_unlocked || false,
      })
      .select("id")
      .single();

    console.log("=== SUPABASE INSERT RESULT ===");
    console.log("DATA:", data);
    console.log("ERROR:", error);
    console.log("==============================");

    if (error) {
      console.error("Supabase insert error details:", JSON.stringify(error, null, 2));
      throw new Error("Failed to save analysis to repository");
    }

    return data.id;
  }

  /**
   * Updates the Premium Report asynchronously.
   */
  static async updatePremiumReport(id: string, premiumReport: any, status: "ready" | "failed"): Promise<void> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("dummy")) {
      console.log(`[MOCK] Premium report updated for ${id} with status ${status}`);
      return;
    }

    const { error } = await supabaseAdmin
      .from("analyses")
      .update({
        premium_report: premiumReport,
        status: { scoring: "completed", report: status }
      })
      .eq("id", id);

    if (error) {
      console.error("Supabase update error:", error);
      throw new Error("Failed to update premium report in repository");
    }
  }

  /**
   * Fetch analysis for the owner. If premium is not unlocked, premium_report is stripped.
   */
  static async getAnalysisForOwner(id: string, providedOwnerToken: string): Promise<any> {
    // 1. Fetch from DB
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("dummy")) {
      // Mock logic for local testing without DB
      return this._mockAnalysis(id, true);
    }

    const { data, error } = await supabaseAdmin
      .from("analyses")
      .select("*")
      .eq("id", id)
      .single();

    console.log("=== SUPABASE SELECT RESULT ===");
    console.log("FETCHED ID:", id);
    console.log("DATA:", data);
    console.log("ERROR:", error);
    console.log("==============================");

    if (error || !data) {
      throw new Error("Analysis not found");
    }

    const ownerTokenHash = hashToken(providedOwnerToken);
    if (data.owner_token_hash !== ownerTokenHash) {
      throw new Error("Unauthorized");
    }

    // 2. Map and filter
    const result = this._mapDbRowToResult(data, true);
    return result;
  }

  /**
   * Fetch public analysis for sharing. Premium report is completely stripped.
   */
  static async getPublicAnalysis(id: string): Promise<any> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("dummy")) {
      return this._mockAnalysis(id, false);
    }

    const { data, error } = await supabaseAdmin
      .from("analyses")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      throw new Error("Analysis not found");
    }

    return this._mapDbRowToResult(data, false);
  }

  /**
   * Unlocks the premium report for a given analysis ID.
   */
  static async unlockPremium(id: string): Promise<void> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("dummy")) {
      console.log(`[MOCK] Premium unlocked for analysis ${id}`);
      return;
    }

    const { error } = await supabaseAdmin
      .from("analyses")
      .update({ premium_unlocked: true })
      .eq("id", id);

    if (error) {
      throw new Error("Failed to unlock premium");
    }
  }

  private static _mapDbRowToResult(data: any, isOwner: boolean): any {
    const isPremiumUnlocked = data.premium_unlocked === true;
    
    const result: any = {
      id: data.id,
      isOwner,
      premium_unlocked: isPremiumUnlocked,
      share_enabled: data.share_enabled,
      share_id: data.share_id,
      analysis: {
        status: data.status || { scoring: "completed", report: "completed" },
        attachment_dimensions: {
          anxiety: data.anxiety_score,
          avoidance: data.avoidance_score
        },
        attachment_fitness: {
          secure: data.secure_fit,
          preoccupied: data.preoccupied_fit,
          dismissing: data.dismissive_fit,
          fearful: data.fearful_fit
        },
        primary_type: data.primary_type,
        secondary_type: data.secondary_type,
        signals: data.extracted_signals,
        target_speaker_label: data.extracted_signals?.target_speaker_label
      }
    };

    // Only include premium report if owner AND unlocked
    if (isOwner && isPremiumUnlocked) {
      result.analysis.premium_report = data.premium_report;
    } else {
      // Strictly ensure it's not present
      delete result.analysis.premium_report;
    }

    return result;
  }

  private static _mockAnalysis(id: string, isOwner: boolean): any {
    const result: any = {
      id,
      isOwner,
      premium_unlocked: false, // Default false for mock
      share_enabled: false,
      share_id: null,
      analysis: {
        status: { scoring: "completed", report: "completed" },
        attachment_dimensions: { anxiety: 46, avoidance: 77 },
        attachment_fitness: { secure: 37, preoccupied: 33, dismissing: 64, fearful: 58 },
        primary_type: "dismissing",
        signals: {}
      }
    };
    return result;
  }
}
