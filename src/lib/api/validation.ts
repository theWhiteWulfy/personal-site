/**
 * Form validation and sanitization utilities
 */

// Email validation regex pattern
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Validation error interface
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Form validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  sanitizedData?: ResourceFormData;
}

// Resource form data interface
export interface ResourceFormData {
  email: string;
  name: string;
  workplace: string;
  role: string;
  resourceName: string;
}

/**
 * Sanitize input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove on* event handlers
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Limit length to prevent abuse
    .substring(0, 500);
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationError | null {
  const sanitized = sanitizeInput(email);
  
  if (!sanitized) {
    return {
      field: 'email',
      message: 'Email is required',
      code: 'REQUIRED'
    };
  }
  
  if (sanitized.length > 254) {
    return {
      field: 'email',
      message: 'Email is too long',
      code: 'TOO_LONG'
    };
  }
  
  if (!EMAIL_REGEX.test(sanitized)) {
    return {
      field: 'email',
      message: 'Please enter a valid email address',
      code: 'INVALID_FORMAT'
    };
  }
  
  return null;
}

/**
 * Validate required text field
 */
export function validateRequiredField(
  value: string, 
  fieldName: string, 
  minLength: number = 1, 
  maxLength: number = 200
): ValidationError | null {
  const sanitized = sanitizeInput(value);
  
  if (!sanitized) {
    return {
      field: fieldName,
      message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`,
      code: 'REQUIRED'
    };
  }
  
  if (sanitized.length < minLength) {
    return {
      field: fieldName,
      message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters`,
      code: 'TOO_SHORT'
    };
  }
  
  if (sanitized.length > maxLength) {
    return {
      field: fieldName,
      message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be less than ${maxLength} characters`,
      code: 'TOO_LONG'
    };
  }
  
  return null;
}

/**
 * Validate resource name
 */
export function validateResourceName(resourceName: string): ValidationError | null {
  const sanitized = sanitizeInput(resourceName);
  
  if (!sanitized) {
    return {
      field: 'resourceName',
      message: 'Resource name is required',
      code: 'REQUIRED'
    };
  }
  
  // Allow only alphanumeric, hyphens, underscores, and spaces
  const validResourceRegex = /^[a-zA-Z0-9\s\-_]+$/;
  if (!validResourceRegex.test(sanitized)) {
    return {
      field: 'resourceName',
      message: 'Resource name contains invalid characters',
      code: 'INVALID_FORMAT'
    };
  }
  
  return null;
}

/**
 * Comprehensive form validation
 */
export function validateResourceForm(formData: FormData): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Extract and validate each field
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;
  const workplace = formData.get('workplace') as string;
  const role = formData.get('role') as string;
  const resourceName = formData.get('resourceName') as string;
  
  // Validate email
  const emailError = validateEmail(email);
  if (emailError) errors.push(emailError);
  
  // Validate name
  const nameError = validateRequiredField(name, 'name', 2, 100);
  if (nameError) errors.push(nameError);
  
  // Validate workplace
  const workplaceError = validateRequiredField(workplace, 'workplace', 2, 200);
  if (workplaceError) errors.push(workplaceError);
  
  // Validate role
  const roleError = validateRequiredField(role, 'role', 2, 100);
  if (roleError) errors.push(roleError);
  
  // Validate resource name
  const resourceError = validateResourceName(resourceName);
  if (resourceError) errors.push(resourceError);
  
  // Return validation result
  if (errors.length > 0) {
    return {
      isValid: false,
      errors
    };
  }
  
  // Return sanitized data if validation passes
  return {
    isValid: true,
    errors: [],
    sanitizedData: {
      email: sanitizeInput(email),
      name: sanitizeInput(name),
      workplace: sanitizeInput(workplace),
      role: sanitizeInput(role),
      resourceName: sanitizeInput(resourceName)
    }
  };
}

/**
 * Format validation errors for API response
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 1) {
    return errors[0].message;
  }
  
  return `Please fix the following errors: ${errors.map(e => e.message).join(', ')}`;
}