// Single control point for the Gemini model/endpoint. Bump GEMINI_MODEL_
// here — nowhere else — when Google deprecates the pinned model. See
// docs/OPERATIONS.md section 6 and docs/DECISIONS.md ADR-0021 (D2).

// ponytail: pinned model, announced shutdown 2027-05-07 — the accepted
// maintenance model is a periodic one-line bump here (run
// smokeTestGeminiCallSites in GeminiClient.js after), no routing/fallback
// abstraction.
var GEMINI_MODEL_ = 'gemini-3.1-flash-lite';
var GEMINI_API_BASE_URL_ = 'https://generativelanguage.googleapis.com/v1beta/models/';
