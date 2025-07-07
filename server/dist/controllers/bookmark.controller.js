"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categorizeBookmarks = void 0;
const gemini_service_1 = require("../services/gemini.service");
const categorizeBookmarks = async (req, res) => {
    try {
        const { userContext, bookmarks } = req.body;
        // Input validation
        if (!userContext ||
            typeof userContext.persona !== 'string' ||
            !Array.isArray(bookmarks)) {
            return res.status(400).json({
                error: 'Invalid input. Expecting userContext (object) and bookmarks (array).',
            });
        }
        // Type cast userContext (safe since we validated above)
        const context = userContext;
        // Call Gemini service
        const categorized = await (0, gemini_service_1.categorizeWithGemini)(context, bookmarks);
        return res.status(200).json(categorized);
    }
    catch (error) {
        console.error('Error in controller:', error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.categorizeBookmarks = categorizeBookmarks;
