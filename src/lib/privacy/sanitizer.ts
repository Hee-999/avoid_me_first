export function sanitizeAnalysisForPersistence(payload: any): any {
  // 1. Defensive Validation (Assertion)
  const stringified = JSON.stringify(payload);
  const forbiddenKeys = [
    "rawConversation", "conversationText", "messages", 
    "originalMessages", "originalText", "rawEvidence"
  ];

  // Also check if any key in the payload itself directly matches
  const checkKeys = (obj: any) => {
    if (typeof obj !== 'object' || obj === null) return;
    for (const key of Object.keys(obj)) {
      if (forbiddenKeys.includes(key)) {
        throw new Error(`Defensive Validation Failed: Forbidden key '${key}' found in persistence payload.`);
      }
      checkKeys(obj[key]);
    }
  };
  checkKeys(payload);

  // Deep clone to avoid mutating original object if needed
  const sanitized = JSON.parse(stringified);

  // 2. Remove any deep nested evidence arrays/objects that might contain raw text,
  // For MVP v2.0, our signals contain `e: string[]` which are message IDs. 
  // We want to delete the `e` array from the persistent storage because they are meaningless
  // without the raw conversation and could potentially be a privacy leak if they contained text.
  if (sanitized.signals) {
    for (const signalKey of Object.keys(sanitized.signals)) {
      if (sanitized.signals[signalKey] && sanitized.signals[signalKey].e) {
        delete sanitized.signals[signalKey].e;
      }
    }
  }

  // If there are any extracted_data.trigger_phrases in legacy mode, we might want to mask them,
  // but for MVP v2.0 we rely purely on structured dimensions and fitness.
  if (sanitized.extracted_data) {
    delete sanitized.extracted_data.trigger_phrases; // These are raw quotes, delete them!
    delete sanitized.extracted_data.signals; // Legacy raw signals
  }

  return sanitized;
}
