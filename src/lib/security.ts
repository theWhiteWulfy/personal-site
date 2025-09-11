/**
 * Security utilities for rate limiting and spam protection
 */

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes in milliseconds
const MAX_REQUESTS_PER_WINDOW = 5; // Maximum requests per IP per window
const MAX_REQUESTS_PER_EMAIL = 3; // Maximum requests per email per window

// Spam detection patterns
const SPAM_PATTERNS = [
  /viagra|cialis|pharmacy/i,
  /casino|gambling|poker/i,
  /loan|mortgage|credit/i,
  /seo\s+service|link\s+building/i,
  /make\s+money|earn\s+\$|get\s+rich/i,
  /click\s+here|visit\s+now/i,
  /free\s+trial|limited\s+time/i
];

// Common spam domains
const SPAM_DOMAINS = [
  'tempmail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'throwaway.email'
];

// Honeypot field names (should be hidden from users)
export const HONEYPOT_FIELDS = ['website', 'url', 'phone_number', 'company_url'];

export interface SecurityCheckResult {
  allowed: boolean;
  reason?: string;
  retryAfter?: number; // seconds until next attempt allowed
}

/**
 * Check if IP address is rate limited
 */
export async function checkRateLimit(
  DB: any, 
  ipAddress: string, 
  email?: string
): Promise<SecurityCheckResult> {
  try {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW;
    
    // Check IP-based rate limiting
    const ipQuery = `
      SELECT COUNT(*) as request_count 
      FROM resource_downloads 
      WHERE ip_address = ?1 
      AND download_timestamp > datetime(?2, 'unixepoch', 'localtime')
    `;
    
    const ipResult = await DB.prepare(ipQuery)
      .bind(ipAddress, Math.floor(windowStart / 1000))
      .first();
    
    if (ipResult?.request_count >= MAX_REQUESTS_PER_WINDOW) {
      return {
        allowed: false,
        reason: 'Rate limit exceeded for IP address',
        retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000)
      };
    }
    
    // Check email-based rate limiting if email provided
    if (email) {
      const emailQuery = `
        SELECT COUNT(*) as request_count 
        FROM resource_downloads 
        WHERE email = ?1 
        AND download_timestamp > datetime(?2, 'unixepoch', 'localtime')
      `;
      
      const emailResult = await DB.prepare(emailQuery)
        .bind(email, Math.floor(windowStart / 1000))
        .first();
      
      if (emailResult?.request_count >= MAX_REQUESTS_PER_EMAIL) {
        return {
          allowed: false,
          reason: 'Rate limit exceeded for email address',
          retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000)
        };
      }
    }
    
    return { allowed: true };
    
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Allow request if rate limit check fails (fail open)
    return { allowed: true };
  }
}

/**
 * Detect spam content in form fields
 */
export function detectSpamContent(formData: {
  name: string;
  workplace: string;
  role: string;
  email: string;
}): SecurityCheckResult {
  const textToCheck = `${formData.name} ${formData.workplace} ${formData.role}`.toLowerCase();
  
  // Check for spam patterns
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(textToCheck)) {
      return {
        allowed: false,
        reason: 'Content flagged as potential spam'
      };
    }
  }
  
  // Check for spam email domains
  const emailDomain = formData.email.split('@')[1]?.toLowerCase();
  if (emailDomain && SPAM_DOMAINS.includes(emailDomain)) {
    return {
      allowed: false,
      reason: 'Email domain flagged as temporary/spam'
    };
  }
  
  // Check for suspicious patterns
  if (textToCheck.length > 1000) {
    return {
      allowed: false,
      reason: 'Content too long'
    };
  }
  
  // Check for excessive repetition
  const words = textToCheck.split(/\s+/);
  const uniqueWords = new Set(words);
  if (words.length > 10 && uniqueWords.size / words.length < 0.3) {
    return {
      allowed: false,
      reason: 'Excessive repetition detected'
    };
  }
  
  return { allowed: true };
}

/**
 * Check honeypot fields for bot detection
 */
export function checkHoneypot(formData: FormData): SecurityCheckResult {
  for (const field of HONEYPOT_FIELDS) {
    const value = formData.get(field);
    if (value && typeof value === 'string' && value.trim() !== '') {
      return {
        allowed: false,
        reason: 'Bot detected via honeypot'
      };
    }
  }
  
  return { allowed: true };
}

/**
 * Comprehensive security check
 */
export async function performSecurityChecks(
  DB: any,
  formData: FormData,
  ipAddress: string
): Promise<SecurityCheckResult> {
  // Check honeypot first (fastest check)
  const honeypotCheck = checkHoneypot(formData);
  if (!honeypotCheck.allowed) {
    return honeypotCheck;
  }
  
  // Extract form data for other checks
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;
  const workplace = formData.get('workplace') as string;
  const role = formData.get('role') as string;
  
  // Check spam content
  const spamCheck = detectSpamContent({ name, workplace, role, email });
  if (!spamCheck.allowed) {
    return spamCheck;
  }
  
  // Check rate limits
  const rateLimitCheck = await checkRateLimit(DB, ipAddress, email);
  if (!rateLimitCheck.allowed) {
    return rateLimitCheck;
  }
  
  return { allowed: true };
}

/**
 * Generate CAPTCHA challenge (simple math-based)
 */
export function generateCaptcha(): { challenge: string; answer: string } {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operations = ['+', '-', '*'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let answer: number;
  switch (operation) {
    case '+':
      answer = num1 + num2;
      break;
    case '-':
      answer = Math.max(num1, num2) - Math.min(num1, num2);
      break;
    case '*':
      answer = num1 * num2;
      break;
    default:
      answer = num1 + num2;
  }
  
  return {
    challenge: `${Math.max(num1, num2)} ${operation} ${Math.min(num1, num2)} = ?`,
    answer: answer.toString()
  };
}

/**
 * Verify CAPTCHA answer
 */
export function verifyCaptcha(userAnswer: string, correctAnswer: string): boolean {
  return userAnswer.trim() === correctAnswer.trim();
}