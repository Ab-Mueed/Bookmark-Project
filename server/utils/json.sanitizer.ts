export const sanitizeGeminiJson = (text: string): string => {
  return text.replace(/```json|```/g, "").trim();
};
