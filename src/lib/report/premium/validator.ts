export function validateKoreanReportChapter(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    let koreanCount = 0;
    let englishCount = 0;

    // Recursive function to extract all string values
    function extractStringValues(obj: any) {
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
  } catch (e) {
    // If it's not valid JSON, we don't handle it here. 
    // generator.ts will throw JSON parse error natively.
    return true; 
  }
}
