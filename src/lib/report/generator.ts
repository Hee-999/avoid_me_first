import { extractFeaturesFromText } from "../analysis/extractor";
import { calculateScores } from "../analysis/scorer";
import { classifyProfile } from "../analysis/classifier";
import { FinalAnalysis } from "../analysis/types";

export async function generateReport(rawText: string): Promise<FinalAnalysis> {
  const extracted = await extractFeaturesFromText(rawText);
  const scored = calculateScores(extracted);
  const profile = classifyProfile(scored);

  return {
    scored,
    profile
  };
}
