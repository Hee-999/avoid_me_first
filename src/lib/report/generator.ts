import { extractFeaturesFromText } from "../analysis/extractor";
import { calculateDimensions } from "../analysis/scorer";
import { classifyTypes, calculateConfidence } from "../analysis/classifier";
import { FinalAnalysis } from "../analysis/types";

export async function generateReport(rawText: string): Promise<FinalAnalysis> {
  const extracted = await extractFeaturesFromText(rawText);
  const dimensions = calculateDimensions(extracted);
  const classified = classifyTypes(dimensions);
  const confidence = calculateConfidence(extracted, dimensions);

  return {
    attachment_dimensions: dimensions,
    attachment_fitness: classified.fitness,
    primary_type: classified.primary,
    secondary_type: classified.secondary,
    is_mixed_pattern: classified.isMixed,
    confidence: confidence,
    extracted_data: extracted
  };
}
