// controllers/bookmarkController.ts
import { Request, Response } from 'express';
import { categorizeWithGemini } from '../services/gemini.service';
import { UserContext } from '../models/bookmark.models';

export const categorizeBookmarks = async (req: Request, res: Response) => {
  try {
    const { userContext, bookmarks } = req.body;

    // Input validation
    if (
      !userContext ||
      typeof userContext.persona !== 'string' ||
      !Array.isArray(bookmarks)
    ) {
      return res.status(400).json({
        error: 'Invalid input. Expecting userContext (object) and bookmarks (array).',
      });
    }

    // Type cast userContext (safe since we validated above)
    const context = userContext as UserContext;

    // Call Gemini service
    const categorized = await categorizeWithGemini(context, bookmarks);

    return res.status(200).json(categorized);
  } catch (error: any) {
    console.error('Error in controller:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
