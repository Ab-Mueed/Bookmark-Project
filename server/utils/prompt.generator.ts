import { Bookmark, UserContext } from "../models/bookmark.models";

export const generatePrompt = (
  userContext: UserContext,
  bookmarks: Bookmark[]
): string => {
  // Format bookmarks with descriptions if available
  const formattedBookmarks = bookmarks.map(bookmark => ({
    title: bookmark.title,
    url: bookmark.url,
    description: bookmark.description || "No description provided"
  }));


  const categoryInstructions = userContext.preferred_structure === "nested_folders"
    ? `CATEGORY REQUIREMENTS FOR NESTED FOLDERS:
- Provide exactly 3 categories per bookmark
- Categories should be structured as: [ParentCategory, SubCategory, SubSubCategory]
- These 3 categories can be combined to form a nested path: ParentCategory/SubCategory/SubSubCategory
- Example: ["Technology", "Programming", "JavaScript"] can form "Technology/Programming/JavaScript"
- Each category should be a single word or short phrase without slashes`
    : `CATEGORY REQUIREMENTS FOR FLAT STRUCTURE:
- Provide exactly 1 category per bookmark
- Use a single, broad category that best describes the bookmark
- Example: ["Technology"], ["Programming"], ["Design"]`;

  return `
You are an expert AI librarian.

Based on the following user's context:
Persona: "${userContext.persona}"
Preferred Structure: "${userContext.preferred_structure}"

Your task is to categorize each bookmark and provide a summary. For each bookmark, assign categories as an array and provide a brief summary.

Categorize the following bookmarks accordingly:
${JSON.stringify(formattedBookmarks, null, 2)}

CRITICAL INSTRUCTIONS:
${categoryInstructions}

ADDITIONAL REQUIREMENTS:
- Add a 'summary' field with a brief description of the bookmark content.
- Use the provided description to generate that summary.
- Categories should be relevant to the bookmark's content and user's persona.

Output format:
Return ONLY a JSON array. No markdown, no explanation, no wrapper object.

Each item must look like:
${userContext.preferred_structure === "nested_folders" 
  ? `{
  "title": "...",
  "url": "...",
  "category": ["ParentCategory", "SubCategory", "SubSubCategory"],
  "summary": "Brief description of the bookmark content"
}`
  : `{
  "title": "...",
  "url": "...",
  "category": ["SingleCategory"],
  "summary": "Brief description of the bookmark content"
}`
}

Remember: ${userContext.preferred_structure === "nested_folders" 
  ? "Exactly 3 categories per bookmark for nested folder structure" 
  : "Exactly 1 category per bookmark for flat structure"}.
`.trim();
};
