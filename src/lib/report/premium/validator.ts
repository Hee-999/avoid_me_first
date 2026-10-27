import { z } from "zod";

export function validateKoreanReportChapter(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    let koreanCount = 0;
    let englishCount = 0;

    // Recursive function to extract all string values
    function extractStringValues(obj: unknown) {
      if (typeof obj === "string") {
        // Count characters
        const koMatch = obj.match(/[가-힣]/g);
        const enMatch = obj.match(/[a-zA-Z]/g);
        
        if (koMatch) koreanCount += koMatch.length;
        if (enMatch) englishCount += enMatch.length;
      } else if (Array.isArray(obj)) {
        obj.forEach(extractStringValues);
      } else if (typeof obj === "object" && obj !== null) {
        Object.values(obj).forEach(extractStringValues);
      }
    }

    extractStringValues(parsed);

    // If total characters are very low, we can't reliably determine, so just pass
    if (koreanCount + englishCount < 50) return true;

    // Heuristic: Korean characters should be significantly more than English characters in values.
    // Allow some English for IDs, terms, but not entire paragraphs.
    // If English characters outnumber Korean characters, it's definitely a FAIL.
    if (englishCount > koreanCount) {
      return false; // Failed language validation
    }

    return true; // Passed
  } catch {
    // If it's not valid JSON, we don't handle it here. 
    // generator.ts will throw JSON parse error natively.
    return true; 
  }
}


// Validate new reports only; existing purchased reports keep their original shape.
const text = z.string().trim().min(2).refine(value => !/^(없음|내용 없음|해당 없음|판단 불가|판단 보류|확인 불가|N\/A|미확인)[.!。]?$/i.test(value), "구체적인 설명이 필요합니다");
const optionalText = z.string().optional();
const texts = z.array(text);
const part1Schema = z.object({
  executive_summary: z.object({ headline: text, body: text, key_points: texts.min(1) }),
  attachment_profile: z.object({ primary_interpretation: text, secondary_interpretation: optionalText, dimension_interpretation: text }),
  behavior_patterns: z.array(z.object({ signal_id: z.string(), title: text, score: z.number().min(0).max(3), strength_label: z.string().trim().min(1), observation: text, interpretation: text, relationship_effect: text, counterpoint: optionalText })),
  evidence_deep_dive: z.array(z.object({ title: text, situation: text, observed_behavior: text, interaction: text, interpretation: text, alternative_explanation: optionalText, conclusion: text })).min(1),
  trigger_profile: z.array(z.object({ trigger: text, observed_response: text, interpretation: text, recommended_approach: text })),
  interaction_loop: z.object({ summary: text, steps: texts, break_points: texts }).optional()
});
const part2Schema = z.object({
  conflict_pattern: z.object({ summary: text, works_better: texts, likely_to_worsen: texts }),
  communication_guide: z.array(z.object({ situation: text, do: text, dont: text, why: text })),
  conversation_rewrites: z.array(z.object({ situation: text, original_pattern_summary: text, recommended_message: text, why: text })).min(1),
  recovery_signals: texts,
  risk_signals: texts,
  action_plan: z.object({ next_conflict: texts, next_7_days: texts.min(1), next_30_days: texts }),
  manual_summary: z.object({ effective_approach: texts.min(1), ineffective_approach: texts, conflict_reentry: text, distance_response: text, relationship_check: text, watch_for: texts, key_sentence: text }),
  methodology: z.object({ body: text })
});

export function validatePremiumReportPart(value: unknown, part: "Part_1" | "Part_2"): string[] {
  const parsed = (part === "Part_1" ? part1Schema : part2Schema).safeParse(value);
  if (parsed.success) return [];
  return parsed.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`);
}
