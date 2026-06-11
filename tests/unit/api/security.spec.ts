/**
 * Task ID: TSK-008
 * Tests for security utilities including rate limiting, spam protection, honeypots, and CAPTCHA.
 */
import { describe, it, expect, vi } from 'vitest';
import {
  checkRateLimit,
  detectSpamContent,
  checkHoneypot,
  performSecurityChecks,
  generateCaptcha,
  verifyCaptcha
} from '@lib/api/security';
import { createMockD1, createMockFormData } from '../../mocks/d1';

describe('detectSpamContent', () => {
  it('should allow clean content', () => {
    const cleanData = {
      name: 'John Doe',
      workplace: 'Acme Corp',
      role: 'Software Developer',
      email: 'john.doe@example.com'
    };
    expect(detectSpamContent(cleanData)).toEqual({ allowed: true });
  });

  it('should block spam patterns in content', () => {
    const spamData = {
      name: 'Buy Viagra Now',
      workplace: 'Acme Corp',
      role: 'Developer',
      email: 'john.doe@example.com'
    };
    expect(detectSpamContent(spamData)).toEqual({
      allowed: false,
      reason: 'Content flagged as potential spam'
    });
  });

  it('should block spam email domains', () => {
    const spamEmailData = {
      name: 'John Doe',
      workplace: 'Acme Corp',
      role: 'Developer',
      email: 'john.doe@tempmail.org'
    };
    expect(detectSpamContent(spamEmailData)).toEqual({
      allowed: false,
      reason: 'Email domain flagged as temporary/spam'
    });
  });

  it('should block long content exceeding 1000 characters', () => {
    const longData = {
      name: 'a'.repeat(400),
      workplace: 'b'.repeat(400),
      role: 'c'.repeat(300),
      email: 'john.doe@example.com'
    };
    expect(detectSpamContent(longData)).toEqual({
      allowed: false,
      reason: 'Content too long'
    });
  });

  it('should block repetitive content', () => {
    const repetitiveData = {
      name: 'hello hello hello hello',
      workplace: 'hello hello hello hello',
      role: 'hello hello hello',
      email: 'john.doe@example.com'
    };
    // total words: 11, unique words: 1. 1/11 = 0.09 < 0.3
    expect(detectSpamContent(repetitiveData)).toEqual({
      allowed: false,
      reason: 'Excessive repetition detected'
    });
  });
});

describe('checkHoneypot', () => {
  it('should allow request when honeypot fields are empty or missing', () => {
    const formData = createMockFormData({
      email: 'user@example.com',
      website: '',
      url: '   '
    });
    expect(checkHoneypot(formData)).toEqual({ allowed: true });
  });

  it('should block request when website honeypot field is filled', () => {
    const formData = createMockFormData({
      email: 'user@example.com',
      website: 'http://spam.com'
    });
    expect(checkHoneypot(formData)).toEqual({
      allowed: false,
      reason: 'Bot detected via honeypot'
    });
  });

  it('should block request when url honeypot field is filled', () => {
    const formData = createMockFormData({
      email: 'user@example.com',
      url: 'http://spam.com'
    });
    expect(checkHoneypot(formData)).toEqual({
      allowed: false,
      reason: 'Bot detected via honeypot'
    });
  });

  it('should block request when phone_number honeypot field is filled', () => {
    const formData = createMockFormData({
      email: 'user@example.com',
      phone_number: '123456789'
    });
    expect(checkHoneypot(formData)).toEqual({
      allowed: false,
      reason: 'Bot detected via honeypot'
    });
  });

  it('should block request when company_url honeypot field is filled', () => {
    const formData = createMockFormData({
      email: 'user@example.com',
      company_url: 'http://spam.com'
    });
    expect(checkHoneypot(formData)).toEqual({
      allowed: false,
      reason: 'Bot detected via honeypot'
    });
  });
});

describe('checkRateLimit', () => {
  it('should block when IP rate limit is exceeded', async () => {
    const db = createMockD1();
    db.first.mockResolvedValue({ request_count: 5 });

    const result = await checkRateLimit(db, '192.168.1.1');
    expect(result).toEqual({
      allowed: false,
      reason: 'Rate limit exceeded for IP address',
      retryAfter: 900
    });
    expect(db.prepare).toHaveBeenCalledTimes(1);
    expect(db.bind).toHaveBeenCalledWith('192.168.1.1', expect.any(Number));
  });

  it('should block when Email rate limit is exceeded', async () => {
    const db = createMockD1();
    // First call for IP count (below threshold), second call for email count (above/equal threshold)
    db.first
      .mockResolvedValueOnce({ request_count: 2 })
      .mockResolvedValueOnce({ request_count: 3 });

    const result = await checkRateLimit(db, '192.168.1.1', 'test@example.com');
    expect(result).toEqual({
      allowed: false,
      reason: 'Rate limit exceeded for email address',
      retryAfter: 900
    });
    expect(db.prepare).toHaveBeenCalledTimes(2);
    expect(db.bind).toHaveBeenNthCalledWith(1, '192.168.1.1', expect.any(Number));
    expect(db.bind).toHaveBeenNthCalledWith(2, 'test@example.com', expect.any(Number));
  });

  it('should allow when both IP and Email are below limits', async () => {
    const db = createMockD1();
    db.first
      .mockResolvedValueOnce({ request_count: 2 })
      .mockResolvedValueOnce({ request_count: 1 });

    const result = await checkRateLimit(db, '192.168.1.1', 'test@example.com');
    expect(result).toEqual({ allowed: true });
    expect(db.prepare).toHaveBeenCalledTimes(2);
  });

  it('should bypass email limit check if email is not provided', async () => {
    const db = createMockD1();
    db.first.mockResolvedValueOnce({ request_count: 2 });

    const result = await checkRateLimit(db, '192.168.1.1');
    expect(result).toEqual({ allowed: true });
    expect(db.prepare).toHaveBeenCalledTimes(1);
  });

  it('should fail open (allow) if a database error occurs', async () => {
    const db = createMockD1();
    db.first.mockRejectedValue(new Error('D1 connection failure'));

    const result = await checkRateLimit(db, '192.168.1.1', 'test@example.com');
    expect(result).toEqual({ allowed: true });
    // console.error is mocked in setup.ts, but let's assert it was called
    expect(console.error).toHaveBeenCalled();
  });
});

describe('generateCaptcha', () => {
  it('should generate a valid math challenge and matching answer', () => {
    const { challenge, answer } = generateCaptcha();
    expect(challenge).toContain(' = ?');
    expect(typeof answer).toBe('string');
    expect(Number.isNaN(Number(answer))).toBe(false);
  });

  it('should produce mathematically correct answers with variance over multiple generations', () => {
    const challenges = new Set<string>();
    const answers = new Set<string>();

    for (let i = 0; i < 20; i++) {
      const { challenge, answer } = generateCaptcha();
      challenges.add(challenge);
      answers.add(answer);

      // Parse challenge: e.g. "10 + 5 = ?" or "10 - 5 = ?" or "10 * 5 = ?"
      const match = challenge.match(/^(\d+)\s+([\+\-\*])\s+(\d+)\s+=\s+\?$/);
      expect(match).not.toBeNull();
      if (match) {
        const num1 = parseInt(match[1], 10);
        const op = match[2];
        const num2 = parseInt(match[3], 10);
        const ans = parseInt(answer, 10);

        if (op === '+') {
          expect(ans).toBe(num1 + num2);
        } else if (op === '-') {
          expect(ans).toBe(num1 - num2);
        } else if (op === '*') {
          expect(ans).toBe(num1 * num2);
        }
      }
    }

    // Verify there is some variance (not all generated captcha challenges/answers are identical)
    expect(challenges.size).toBeGreaterThan(1);
    expect(answers.size).toBeGreaterThan(1);
  });
});

describe('verifyCaptcha', () => {
  it('should verify matching answers', () => {
    expect(verifyCaptcha('5', '5')).toBe(true);
  });

  it('should reject non-matching answers', () => {
    expect(verifyCaptcha('5', '6')).toBe(false);
    expect(verifyCaptcha('5', 'abc')).toBe(false);
  });

  it('should ignore whitespace during verification', () => {
    expect(verifyCaptcha('  5  ', '5')).toBe(true);
    expect(verifyCaptcha('5', '  5  ')).toBe(true);
    expect(verifyCaptcha('  5  ', '  5  ')).toBe(true);
  });
});

describe('performSecurityChecks', () => {
  it('should fail fast on honeypot match and not run subsequent checks', async () => {
    const db = createMockD1();
    const formData = createMockFormData({
      website: 'http://bot.com',
      email: 'spam@tempmail.org', // spam email
      name: 'John Doe',
      workplace: 'Acme Corp',
      role: 'Developer'
    });

    const result = await performSecurityChecks(db, formData, '192.168.1.1');
    expect(result).toEqual({
      allowed: false,
      reason: 'Bot detected via honeypot'
    });
    // DB query shouldn't have run
    expect(db.prepare).not.toHaveBeenCalled();
  });

  it('should block on spam content and not check rate limit', async () => {
    const db = createMockD1();
    const formData = createMockFormData({
      website: '', // clean honeypot
      email: 'spam@tempmail.org', // spam email
      name: 'John Doe',
      workplace: 'Acme Corp',
      role: 'Developer'
    });

    const result = await performSecurityChecks(db, formData, '192.168.1.1');
    expect(result).toEqual({
      allowed: false,
      reason: 'Email domain flagged as temporary/spam'
    });
    // DB query shouldn't have run
    expect(db.prepare).not.toHaveBeenCalled();
  });

  it('should block on rate limit if honeypot and spam are clean', async () => {
    const db = createMockD1();
    db.first.mockResolvedValue({ request_count: 5 }); // IP rate limited

    const formData = createMockFormData({
      website: '',
      email: 'clean@example.com',
      name: 'John Doe',
      workplace: 'Acme Corp',
      role: 'Developer'
    });

    const result = await performSecurityChecks(db, formData, '192.168.1.1');
    expect(result).toEqual({
      allowed: false,
      reason: 'Rate limit exceeded for IP address',
      retryAfter: 900
    });
    expect(db.prepare).toHaveBeenCalledTimes(1);
  });

  it('should allow request if all security checks pass', async () => {
    const db = createMockD1();
    db.first
      .mockResolvedValueOnce({ request_count: 1 }) // IP limit clean
      .mockResolvedValueOnce({ request_count: 1 }); // Email limit clean

    const formData = createMockFormData({
      website: '',
      email: 'clean@example.com',
      name: 'John Doe',
      workplace: 'Acme Corp',
      role: 'Developer'
    });

    const result = await performSecurityChecks(db, formData, '192.168.1.1');
    expect(result).toEqual({ allowed: true });
    expect(db.prepare).toHaveBeenCalledTimes(2);
  });
});
