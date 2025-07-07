import express from 'express';
import { categorizeBookmarks } from '../controllers/bookmark.controller';

const router = express.Router();

router.post('/categorize', categorizeBookmarks);

export default router;
