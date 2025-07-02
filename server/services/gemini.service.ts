// services/geminiService.ts

import genAI from "../config/gemini.config";
import { chunkArray } from "../utils/chunker";
import { sanitizeGeminiJson } from "../utils/json.sanitizer";
import { generatePrompt } from "../utils/prompt.generator";
import {
  Bookmark,
  CategorizedBookmark,
  UserContext,
} from "../models/bookmark.models";

/**
 * Sends bookmarks to Gemini in chunks and returns categorized results.
 */
export const categorizeWithGemini = async (
  userContext: UserContext,
  bookmarks: Bookmark[]
): Promise<CategorizedBookmark[]> => {
  const model = genAI.getGenerativeModel({
    model: "models/gemini-1.5-flash",
  });

  const chunks = chunkArray(bookmarks, 20); // you can change this size later
  let finalResults: CategorizedBookmark[] = [];

  for (const chunk of chunks) {
    const prompt = generatePrompt(userContext, chunk);

    try {
      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      const cleanText = sanitizeGeminiJson(rawText);

      let parsed: any;

      try {
        parsed = JSON.parse(cleanText);

        // Handle both formats:
        // 1. Direct array of bookmarks
        // 2. Object with { bookmarks: [...] }
        if (Array.isArray(parsed)) {
          finalResults = finalResults.concat(parsed);
        } else if (parsed.bookmarks && Array.isArray(parsed.bookmarks)) {
          finalResults = finalResults.concat(parsed.bookmarks);
        } else {
          console.warn("Gemini response format unrecognized:", parsed);
        }
      } catch (e) {
        if (e instanceof Error) {
          console.error("JSON parse failed:", e.message);
        } else {
          console.error("JSON parse failed:", e);
        }
        console.debug("Raw Gemini output:", cleanText);
      }
    } catch (error: any) {
      console.error("Gemini error or bad response:", error.message);
    }
  }

  return finalResults;
};
