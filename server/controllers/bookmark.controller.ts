// controllers/bookmarkController.ts
import { Request, Response } from 'express';
import { categorizeWithGemini } from '../services/gemini.service';
import { CategorizeRequest, UserContext } from '../models/bookmark.models';

export const categorizeBookmarks = async (req: Request, res: Response) => {
  try {
    const { userContext, bookmarks } = req.body as CategorizeRequest;

    // Log the incoming payload from frontend
    console.log('Received payload from frontend:', req.body);

    // Input validation
    if (!userContext || !bookmarks) {
      return res.status(400).json({
        error: 'Invalid input. Expecting userContext and bookmarks.',
      });
    }

    if (typeof userContext.persona !== 'string') {
      return res.status(400).json({
        error: 'userContext.persona must be a string.',
      });
    }

    if (!Array.isArray(bookmarks)) {
      return res.status(400).json({
        error: 'bookmarks must be an array.',
      });
    }

    // Validate each bookmark has required fields
    for (const bookmark of bookmarks) {
      if (!bookmark.title || !bookmark.url) {
        return res.status(400).json({
          error: 'Each bookmark must have title and url fields.',
        });
      }
    }

    // Call Gemini service
    const categorized = await categorizeWithGemini(userContext, bookmarks);

    return res.status(200).json({ bookmarks: categorized });
  } catch (error: any) {
    console.error('Error in controller:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

