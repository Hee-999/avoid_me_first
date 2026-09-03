import { NextResponse, after } from "next/server";
import { cookies } from "next/headers";
import { generateOwnerToken, hashToken } from "@/lib/supabase/server";
import { AnalysisRepository } from "@/lib/repository/analysisRepository";
import { analyzeConversationMvpV2 } from "@/lib/analysis/mvp/extractor";
import { preprocessConversation } from "@/lib/analysis/preprocessor";
import { buildDerivedReportContext } from "@/lib/report/premium/contextBuilder";
import { generatePremiumReport } from "@/lib/report/premium/generator";

export async function POST(request: Request) {
  try {
    const { text, target_speaker_id, target_speaker_label } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid text input" }, { status: 400 });
    }
    
    if (!target_speaker_id) {
      return NextResponse.json({ error: "TARGET_REQUIRED" }, { status: 400 });
    }

    const preprocessed = preprocessConversation(text);
    
    if (preprocessed.messages.length === 0) {
      return NextResponse.json({ error: "No valid conversation found in the text." }, { status: 400 });
    }

    // Convert to the simple format expected by the prompt and context builder
    const mappedMessages = preprocessed.messages.map(m => ({
      speaker: m.speaker_id,
      time: m.timestamp || "unknown",
      text: m.text,
      message_id: m.id
    }));
    
    const conversationJsonString = JSON.stringify(mappedMessages);
    
    // =========================================================================
    // CRITICAL PATH (Blocks response)
    // =========================================================================

    // 1. MVP Scoring (Requires Raw Text)
    const { result: analysisResult, error: analysisError } = await analyzeConversationMvpV2({
      conversationJson: conversationJsonString,
      targetSpeaker: target_speaker_id
    });

    if (analysisError || !analysisResult) {
      return NextResponse.json({ error: "Analysis failed: " + analysisError }, { status: 500 });
    }

    // 2. Derived Context Generation (Requires Raw Text)
    const derivedContext = await buildDerivedReportContext(
      conversationJsonString,
      target_speaker_id,
      analysisResult
    );

    // 3. Construct Persistent Payload (Safe to save, no raw text)
    const persistentPayload = {
      ...analysisResult,
      target_speaker_label: target_speaker_label || target_speaker_id,
      derived_context: derivedContext,
      premium_report: null, // Will be generated async
      access: { premium_unlocked: false },
      status: { scoring: "completed", report: "generating" }
    };

    // 4. Save to Repository (Sanitization layer will double-check for raw text)
    const ownerToken = generateOwnerToken();
    const ownerTokenHash = hashToken(ownerToken);
    const analysisId = await AnalysisRepository.saveAnalysisResult(persistentPayload, ownerTokenHash);

    // =========================================================================
    // BACKGROUND ASYNC PATH (Does NOT block response)
    // =========================================================================

    // Generate heavy Premium Report v2.0 in the background using ONLY safe Derived Context.
    // In Vercel, this might need `waitUntil()` or Inngest/QStash for guaranteed execution,
    // but a floating promise works for local/Node environments.
    // Generate heavy Premium Report v2.0 in the background safely using Next.js `after`
    after(async () => {
      try {
        const premiumReport = await generatePremiumReport(analysisResult, derivedContext);
        await AnalysisRepository.updatePremiumReport(analysisId, premiumReport, "ready");
      } catch (err) {
        console.error(`Premium Report Generation Failed for ${analysisId}:`, err);
        await AnalysisRepository.updatePremiumReport(analysisId, null, "failed");
      }
    });

    // =========================================================================
    // RESPOND IMMEDIATELY TO CLIENT
    // =========================================================================


    // 4. Set HttpOnly Cookie for Owner Session
    // Next.js 15 requires awaiting cookies()
    const cookieStore = await cookies();
    cookieStore.set("avoidance_owner_token", ownerToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });

    // 5. Return the ID (Client will redirect to /result/[id])
    return NextResponse.json({ id: analysisId });
    
  } catch (error) {
    console.error("Analyze API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
