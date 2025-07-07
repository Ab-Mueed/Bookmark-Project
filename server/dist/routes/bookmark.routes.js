"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookmark_controller_1 = require("../controllers/bookmark.controller");
const router = express_1.default.Router();
// POST /api/bookmarks/categorize
// Accepts user's persona + list of bookmarks, returns categorized bookmarks
router.post('/categorize', bookmark_controller_1.categorizeBookmarks);
exports.default = router;
