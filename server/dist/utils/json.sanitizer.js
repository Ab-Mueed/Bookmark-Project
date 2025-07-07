"use strict";
// utils/jsonSanitizer.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeGeminiJson = void 0;
/**
 * Removes markdown-style code blocks (```json ... ```) from Gemini responses.
 */
const sanitizeGeminiJson = (text) => {
    return text.replace(/```json|```/g, "").trim();
};
exports.sanitizeGeminiJson = sanitizeGeminiJson;
