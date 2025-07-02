import { Bookmark, UserContext } from "../models/bookmark.models";

export const generatePrompt = (
  userContext: UserContext,
  bookmarks: Bookmark[]
): string => {
  return `
You are an expert AI librarian.

Based on the following user's context:
Persona: "${userContext.persona}"
Preferred Structure: "${userContext.preferred_structure}"


Categorize the following bookmarks accordingly:
${JSON.stringify(bookmarks, null, 2)}

Instructions:
- For each bookmark, add a 'category' field.
- If 'preferred_structure' is 'nested_folders', use nested paths like "Main/Sub/SubSub".


Output format:
Return ONLY a JSON array. No markdown, no explanation, no wrapper object.

Each item must look like:
{
  "title": "...",
  "url": "...",
  "category": "..."
}
`.trim();
};
