/**
 * Admin API authentication utilities
 */

/**
 * Check whether a request carries a valid admin Bearer key.
 * Compares in constant time to prevent timing attacks.
 */
export function requireAdminAuth(request: Request, env: { ADMIN_API_KEY?: string }): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  const token = authHeader.slice(7);
  const adminKey = env?.ADMIN_API_KEY;
  if (!adminKey || !token) return false;

  return timingSafeEqual(token, adminKey);
}

/**
 * Standard 401 response for unauthenticated admin requests
 */
export function unauthorizedResponse(): Response {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Constant-time string comparison
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
