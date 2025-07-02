import express from 'express';
import { categorizeBookmarks } from '../controllers/bookmark.controller';

const router = express.Router();

// POST /api/bookmarks/categorize
// Accepts user's persona + list of bookmarks, returns categorized bookmarks
router.post('/categorize', categorizeBookmarks);

export default router;
