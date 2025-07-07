"use strict";
// services/geminiService.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categorizeWithGemini = void 0;
const gemini_config_1 = __importDefault(require("../config/gemini.config"));
const chunker_1 = require("../utils/chunker");
const json_sanitizer_1 = require("../utils/json.sanitizer");
const prompt_generator_1 = require("../utils/prompt.generator");
/**
 * Sends bookmarks to Gemini in chunks and returns categorized results.
 */
const categorizeWithGemini = async (userContext, bookmarks) => {
    const model = gemini_config_1.default.getGenerativeModel({
        model: "models/gemini-1.5-flash",
    });
    const chunks = (0, chunker_1.chunkArray)(bookmarks, 20); // you can change this size later
    let finalResults = [];
    for (const chunk of chunks) {
        const prompt = (0, prompt_generator_1.generatePrompt)(userContext, chunk);
        try {
            const result = await model.generateContent(prompt);
            const rawText = result.response.text();
            const cleanText = (0, json_sanitizer_1.sanitizeGeminiJson)(rawText);
            let parsed;
            try {
                parsed = JSON.parse(cleanText);
                // Handle both formats:
                // 1. Direct array of bookmarks
                // 2. Object with { bookmarks: [...] }
                if (Array.isArray(parsed)) {
                    finalResults = finalResults.concat(parsed);
                }
                else if (parsed.bookmarks && Array.isArray(parsed.bookmarks)) {
                    finalResults = finalResults.concat(parsed.bookmarks);
                }
                else {
                    console.warn("Gemini response format unrecognized:", parsed);
                }
            }
            catch (e) {
                if (e instanceof Error) {
                    console.error("JSON parse failed:", e.message);
                }
                else {
                    console.error("JSON parse failed:", e);
                }
                console.debug("Raw Gemini output:", cleanText);
            }
        }
        catch (error) {
            console.error("Gemini error or bad response:", error.message);
        }
    }
    return finalResults;
};
exports.categorizeWithGemini = categorizeWithGemini;
