import genAI from "../config/gemini.config";
import { chunkArray } from "../utils/chunker";
import { sanitizeGeminiJson } from "../utils/json.sanitizer";
import { generatePrompt } from "../utils/prompt.generator";
import {
  Bookmark,
  CategorizedBookmark,
  UserContext,
} from "../models/bookmark.models";


export const categorizeWithGemini = async (
  userContext: UserContext,
  bookmarks: Bookmark[]
): Promise<CategorizedBookmark[]> => {
  const model = genAI.getGenerativeModel({
    model: "models/gemini-1.5-flash",
  });

  const chunks = chunkArray(bookmarks, 20);
  let finalResults: CategorizedBookmark[] = [];
  const categoryLimit = userContext.preferred_structure === "nested_folders" ? 3 : 1;

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
        let bookmarkArray: any[];
        if (Array.isArray(parsed)) {
          bookmarkArray = parsed;
        } else if (parsed.bookmarks && Array.isArray(parsed.bookmarks)) {
          bookmarkArray = parsed.bookmarks;
        } else {
          console.warn("Gemini response format unrecognized:", parsed);
          continue;
        }

        // Validate and transform each bookmark
        for (let i = 0; i < bookmarkArray.length; i++) {
          const aiBookmark = bookmarkArray[i];
          const originalBookmark = chunk[i]; // Get the original bookmark to preserve fields
          
          if (aiBookmark.title && aiBookmark.url && aiBookmark.category && aiBookmark.summary) {
            // Ensure category is an array and limit the number of categories
            let categoryArray = Array.isArray(aiBookmark.category) 
              ? aiBookmark.category 
              : [aiBookmark.category];
            
            // Enforce category limit
            if (categoryArray.length > categoryLimit) {
              console.warn(`Bookmark "${aiBookmark.title}" has ${categoryArray.length} categories, limiting to ${categoryLimit}`);
              categoryArray = categoryArray.slice(0, categoryLimit);
            }
            
            // Create categorized bookmark preserving original fields
            const categorizedBookmark: CategorizedBookmark = {
              // Preserve original fields
              id: originalBookmark.id,
              title: aiBookmark.title,
              url: aiBookmark.url,
              description: originalBookmark.description,
              dateAdded: originalBookmark.dateAdded,
              parentId: originalBookmark.parentId,
              // Add AI-generated fields
              category: categoryArray,
              summary: aiBookmark.summary
            };
            
            finalResults.push(categorizedBookmark);
          }
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
