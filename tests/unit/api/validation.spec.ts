/**
 * Task ID: TSK-007
 * Tests for form validation and sanitization utilities
 */
import { describe, it, expect } from 'vitest';
import {
  sanitizeInput,
  validateEmail,
  validateRequiredField,
  validateResourceName,
  validateResourceForm,
  formatValidationErrors
} from '@lib/api/validation';
import { createMockFormData } from '../../mocks/d1';

describe('sanitizeInput', () => {
  it('should strip HTML tags from input', () => {
    expect(sanitizeInput('<script>alert("xss")</script>test')).toBe('test');
    expect(sanitizeInput('<p>paragraph</p>')).toBe('paragraph');
    expect(sanitizeInput('<a href="https://example.com">link</a>')).toBe('link');
    expect(sanitizeInput('text with <strong>bold</strong>')).toBe('text with bold');
  });

  it('should truncate input at 500 characters', () => {
    const longInput = 'a'.repeat(600);
    const sanitized = sanitizeInput(longInput);
    expect(sanitized.length).toBe(500);
    expect(sanitized).toBe('a'.repeat(500));
  });

  it('should return empty string for non-string input', () => {
    // Cast to any to bypass TS compilation check for test coverage of runtime safety
    expect(sanitizeInput(null as any)).toBe('');
    expect(sanitizeInput(undefined as any)).toBe('');
    expect(sanitizeInput(123 as any)).toBe('');
    expect(sanitizeInput({} as any)).toBe('');
  });

  it('should trim whitespace from input', () => {
    expect(sanitizeInput('   trimmed text   ')).toBe('trimmed text');
    expect(sanitizeInput('\n\t  tabbed text  \n')).toBe('tabbed text');
  });
});

describe('validateEmail', () => {
  it('should return null for a valid email', () => {
    expect(validateEmail('test@example.com')).toBeNull();
    expect(validateEmail('user.name+tag@domain.co.uk')).toBeNull();
    expect(validateEmail('a@b.co')).toBeNull();
  });

  it('should return REQUIRED error for empty or whitespace-only email', () => {
    const emptyResult = validateEmail('');
    expect(emptyResult).toEqual({
      field: 'email',
      message: 'Email is required',
      code: 'REQUIRED',
    });

    const spaceResult = validateEmail('   ');
    expect(spaceResult).toEqual({
      field: 'email',
      message: 'Email is required',
      code: 'REQUIRED',
    });
  });

  it('should return TOO_LONG error for emails longer than 254 characters', () => {
    const longLocal = 'a'.repeat(245);
    const longEmail = `${longLocal}@example.com`; // 245 + 12 = 257 chars
    const result = validateEmail(longEmail);
    expect(result).toEqual({
      field: 'email',
      message: 'Email is too long',
      code: 'TOO_LONG',
    });
  });

  it('should return INVALID_FORMAT error for invalid email structures', () => {
    const invalidEmails = [
      'plain_text',
      '@domain.com',
      'test@',
      'test@.com',
      'test@@domain.com',
      'test@domain..com'
    ];

    for (const email of invalidEmails) {
      const result = validateEmail(email);
      expect(result).toEqual({
        field: 'email',
        message: 'Please enter a valid email address',
        code: 'INVALID_FORMAT',
      });
    }
  });
});

describe('validateRequiredField', () => {
  it('should return REQUIRED error if input is empty or whitespace-only', () => {
    const result = validateRequiredField('', 'username');
    expect(result).toEqual({
      field: 'username',
      message: 'Username is required',
      code: 'REQUIRED',
    });

    const spaceResult = validateRequiredField('   ', 'username');
    expect(spaceResult).toEqual({
      field: 'username',
      message: 'Username is required',
      code: 'REQUIRED',
    });
  });

  it('should capitalize the field name in the error message', () => {
    const result = validateRequiredField('', 'role');
    expect(result?.message).toBe('Role is required');
  });

  it('should return TOO_SHORT error if input length is less than minLength', () => {
    const result = validateRequiredField('abc', 'username', 5, 10);
    expect(result).toEqual({
      field: 'username',
      message: 'Username must be at least 5 characters',
      code: 'TOO_SHORT',
    });
  });

  it('should return TOO_LONG error if input length exceeds maxLength', () => {
    const result = validateRequiredField('abcdefghijk', 'username', 1, 10);
    expect(result).toEqual({
      field: 'username',
      message: 'Username must be less than 10 characters',
      code: 'TOO_LONG',
    });
  });

  it('should return null for valid inputs within length constraints', () => {
    expect(validateRequiredField('abc', 'username', 2, 5)).toBeNull();
    expect(validateRequiredField('abcde', 'username', 2, 5)).toBeNull();
  });
});

describe('validateResourceName', () => {
  it('should return null for a valid resource name', () => {
    expect(validateResourceName('Valid-Resource_Name 123')).toBeNull();
    expect(validateResourceName('simple')).toBeNull();
  });

  it('should return REQUIRED error if resource name is empty or whitespace-only', () => {
    const result = validateResourceName('');
    expect(result).toEqual({
      field: 'resourceName',
      message: 'Resource name is required',
      code: 'REQUIRED',
    });

    const spaceResult = validateResourceName('   ');
    expect(spaceResult).toEqual({
      field: 'resourceName',
      message: 'Resource name is required',
      code: 'REQUIRED',
    });
  });

  it('should return INVALID_FORMAT error for invalid characters', () => {
    const invalidNames = [
      'Resource!',
      'Res@ource',
      'res#name',
      'res%name',
      'res$name',
      'name/resource',
      'name\\resource'
    ];

    for (const name of invalidNames) {
      const result = validateResourceName(name);
      expect(result).toEqual({
        field: 'resourceName',
        message: 'Resource name contains invalid characters',
        code: 'INVALID_FORMAT',
      });
    }
  });
});

describe('validateResourceForm', () => {
  it('should pass and return sanitized data when all fields are valid', () => {
    const formData = createMockFormData({
      email: '  test@example.com  ',
      name: '  John Doe  ',
      workplace: '  Acme Corp  ',
      role: '  Developer  ',
      resourceName: '  Awesome-Resource_1  ',
    });

    const result = validateResourceForm(formData);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.sanitizedData).toEqual({
      email: 'test@example.com',
      name: 'John Doe',
      workplace: 'Acme Corp',
      role: 'Developer',
      resourceName: 'Awesome-Resource_1',
    });
  });

  it('should collect errors when fields are missing or invalid', () => {
    const formData = createMockFormData({
      email: 'invalid-email',
      name: 'J', // too short (minLength = 2)
      workplace: '   ', // empty -> REQUIRED
      role: 'a'.repeat(101), // too long (maxLength = 100)
      resourceName: 'Invalid@Resource', // invalid chars
    });

    const result = validateResourceForm(formData);

    expect(result.isValid).toBe(false);
    expect(result.sanitizedData).toBeUndefined();
    expect(result.errors).toHaveLength(5);

    expect(result.errors[0]).toEqual({
      field: 'email',
      message: 'Please enter a valid email address',
      code: 'INVALID_FORMAT',
    });

    expect(result.errors[1]).toEqual({
      field: 'name',
      message: 'Name must be at least 2 characters',
      code: 'TOO_SHORT',
    });

    expect(result.errors[2]).toEqual({
      field: 'workplace',
      message: 'Workplace is required',
      code: 'REQUIRED',
    });

    expect(result.errors[3]).toEqual({
      field: 'role',
      message: 'Role must be less than 100 characters',
      code: 'TOO_LONG',
    });

    expect(result.errors[4]).toEqual({
      field: 'resourceName',
      message: 'Resource name contains invalid characters',
      code: 'INVALID_FORMAT',
    });
  });

  it('should collect errors even if email is missing completely', () => {
    const formData = createMockFormData({
      name: 'John Doe',
      workplace: 'Acme Corp',
      role: 'Developer',
      resourceName: 'Awesome-Resource_1',
    });

    const result = validateResourceForm(formData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual({
      field: 'email',
      message: 'Email is required',
      code: 'REQUIRED',
    });
  });
});

describe('formatValidationErrors', () => {
  it('should format a single validation error message', () => {
    const errors = [
      { field: 'email', message: 'Email is required', code: 'REQUIRED' }
    ];
    expect(formatValidationErrors(errors)).toBe('Email is required');
  });

  it('should format multiple validation error messages into a comma-joined list', () => {
    const errors = [
      { field: 'email', message: 'Email is required', code: 'REQUIRED' },
      { field: 'name', message: 'Name must be at least 2 characters', code: 'TOO_SHORT' },
      { field: 'resourceName', message: 'Resource name contains invalid characters', code: 'INVALID_FORMAT' }
    ];
    
    expect(formatValidationErrors(errors)).toBe(
      'Please fix the following errors: Email is required, Name must be at least 2 characters, Resource name contains invalid characters'
    );
  });

  it('should return expected text even if errors array is empty', () => {
    expect(formatValidationErrors([])).toBe('Please fix the following errors: ');
  });
});
