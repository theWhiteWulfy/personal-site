# Coding Preferences

## Style & Patterns
- Prefers utility functions extracted to shared modules (e.g., `src/lib/api/auth.ts` for admin auth). Confidence: 0.85
- Guards runtime secrets with 503 responses when missing, rather than crashing. Confidence: 0.9
- Prefers async token signing/verification using Web Crypto (`crypto.subtle`) over synchronous polyfills. Confidence: 0.9
- Auth checks go at the top of API route handlers, before any DB access. Confidence: 0.9

## Testing
- Updates existing tests when behavior changes (e.g., adding auth headers to GET stats tests after auth gate is added). Confidence: 0.9
- Adds dedicated tests for new security gates (401 without key, 401 with wrong key, success with valid key). Confidence: 0.9
- Mock helpers accept `env` overrides to inject additional env bindings. Confidence: 0.85
