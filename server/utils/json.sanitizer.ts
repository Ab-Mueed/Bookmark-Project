// utils/jsonSanitizer.ts

/**
 * Removes markdown-style code blocks (```json ... ```) from Gemini responses.
 */
export const sanitizeGeminiJson = (text: string): string => {
  return text.replace(/```json|```/g, "").trim();
};
