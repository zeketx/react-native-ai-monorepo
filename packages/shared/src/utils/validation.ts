/**
 * Validation Utilities
 * Shared validation functions for forms, inputs, and data
 */

import { REGEX } from '../constants/app';
import type { ValidationError } from '../types';

// Default allowed email domains for allowlist checking
const DEFAULT_ALLOWED_DOMAINS = [
  '@clientsync.com',
  '@partner.com', 
  '@enterprise.com'
];

// Email validation
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return REGEX.EMAIL.test(email.trim().toLowerCase());
}

export function validateEmailWithMessage(email: string): ValidationError | null {
  if (!email) {
    return { field: 'email', message: 'Email is required' };
  }
  if (!validateEmail(email)) {
    return { field: 'email', message: 'Please enter a valid email address' };
  }
  return null;
}

// Password validation
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return { isValid: errors.length === 0, errors };
}

export function validatePasswordWithMessage(password: string): ValidationError[] {
  const { isValid, errors } = validatePassword(password);
  return errors.map(error => ({ field: 'password', message: error }));
}

// Phone number validation
export function validatePhone(phone: string, format: 'us' | 'international' = 'us'): boolean {
  if (!phone || typeof phone !== 'string') return false;
  
  const cleanPhone = phone.replace(/\s+/g, '');
  
  if (format === 'us') {
    return REGEX.PHONE_US.test(cleanPhone);
  } else {
    return REGEX.PHONE_INTERNATIONAL.test(cleanPhone);
  }
}

export function validatePhoneWithMessage(phone: string, format: 'us' | 'international' = 'us'): ValidationError | null {
  if (!phone) {
    return null; // Phone is typically optional
  }
  if (!validatePhone(phone, format)) {
    const message = format === 'us' 
      ? 'Please enter a valid US phone number (e.g., (555) 123-4567)'
      : 'Please enter a valid international phone number (e.g., +1 555 123 4567)';
    return { field: 'phone', message };
  }
  return null;
}

// Name validation
export function validateName(name: string, fieldName: string = 'Name'): ValidationError | null {
  if (!name || typeof name !== 'string') {
    return { field: fieldName.toLowerCase(), message: `${fieldName} is required` };
  }
  
  const trimmed = name.trim();
  if (trimmed.length < 1) {
    return { field: fieldName.toLowerCase(), message: `${fieldName} is required` };
  }
  
  if (trimmed.length > 50) {
    return { field: fieldName.toLowerCase(), message: `${fieldName} must be 50 characters or less` };
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s\-']+$/.test(trimmed)) {
    return { field: fieldName.toLowerCase(), message: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` };
  }
  
  return null;
}

// Date validation
export function validateDate(dateString: string): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

export function validateDateRange(startDate: string, endDate: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!validateDate(startDate)) {
    errors.push({ field: 'startDate', message: 'Start date is required and must be valid' });
  }
  
  if (!validateDate(endDate)) {
    errors.push({ field: 'endDate', message: 'End date is required and must be valid' });
  }
  
  if (validateDate(startDate) && validateDate(endDate)) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      errors.push({ field: 'endDate', message: 'End date must be after start date' });
    }
    
    // Check if dates are too far in the future (e.g., more than 2 years)
    const twoYearsFromNow = new Date();
    twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
    
    if (start > twoYearsFromNow) {
      errors.push({ field: 'startDate', message: 'Start date cannot be more than 2 years in the future' });
    }
  }
  
  return errors;
}

// URL validation
export function validateUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return REGEX.URL.test(url.trim());
}

// File validation
export function validateFile(
  file: File, 
  allowedTypes: string[],
  maxSizeBytes: number
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!file) {
    errors.push({ field: 'file', message: 'File is required' });
    return errors;
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes.map(type => {
      const ext = type.split('/')[1];
      return ext === 'jpeg' ? 'jpg' : ext;
    }).join(', ');
    errors.push({ 
      field: 'file', 
      message: `File type not allowed. Allowed types: ${allowedExtensions}` 
    });
  }
  
  // Check file size
  if (file.size > maxSizeBytes) {
    const maxMB = Math.round(maxSizeBytes / (1024 * 1024));
    errors.push({ 
      field: 'file', 
      message: `File size must be less than ${maxMB}MB` 
    });
  }
  
  return errors;
}

// Required field validation
export function validateRequired(value: any, fieldName: string): ValidationError | null {
  if (value === null || value === undefined || value === '') {
    return { field: fieldName, message: `${fieldName} is required` };
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return { field: fieldName, message: `${fieldName} is required` };
  }
  
  if (Array.isArray(value) && value.length === 0) {
    return { field: fieldName, message: `${fieldName} is required` };
  }
  
  return null;
}

// String length validation
export function validateLength(
  value: string,
  fieldName: string,
  min?: number,
  max?: number
): ValidationError | null {
  if (!value) return null; // Use validateRequired separately if needed
  
  const length = value.trim().length;
  
  if (min !== undefined && length < min) {
    return { 
      field: fieldName, 
      message: `${fieldName} must be at least ${min} characters long` 
    };
  }
  
  if (max !== undefined && length > max) {
    return { 
      field: fieldName, 
      message: `${fieldName} must be ${max} characters or less` 
    };
  }
  
  return null;
}

// Numeric validation
export function validateNumber(
  value: string | number,
  fieldName: string,
  min?: number,
  max?: number
): ValidationError | null {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return { field: fieldName, message: `${fieldName} must be a valid number` };
  }
  
  if (min !== undefined && num < min) {
    return { field: fieldName, message: `${fieldName} must be at least ${min}` };
  }
  
  if (max !== undefined && num > max) {
    return { field: fieldName, message: `${fieldName} must be ${max} or less` };
  }
  
  return null;
}

// Credit card validation (basic Luhn algorithm)
export function validateCreditCard(cardNumber: string): boolean {
  if (!cardNumber || typeof cardNumber !== 'string') return false;
  
  const digits = cardNumber.replace(/\D/g, '');
  if (!REGEX.CREDIT_CARD.test(digits)) return false;
  
  // Luhn algorithm
  let sum = 0;
  let alternate = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    
    if (alternate) {
      digit *= 2;
      if (digit > 9) {
        digit = (digit % 10) + 1;
      }
    }
    
    sum += digit;
    alternate = !alternate;
  }
  
  return (sum % 10) === 0;
}

// Batch validation helper
export function validateForm(
  data: Record<string, any>,
  rules: Record<string, ((value: any) => ValidationError | ValidationError[] | null)[]>
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  for (const [field, validators] of Object.entries(rules)) {
    const value = data[field];
    
    for (const validator of validators) {
      const result = validator(value);
      
      if (result) {
        if (Array.isArray(result)) {
          errors.push(...result);
        } else {
          errors.push(result);
        }
        break; // Stop at first error for this field
      }
    }
  }
  
  return errors;
}

// Email allowlist validation
export function isAllowedDomain(email: string, allowedDomains?: string[]): boolean {
  if (!validateEmail(email)) return false;
  
  const domains = allowedDomains || DEFAULT_ALLOWED_DOMAINS;
  const emailLower = email.toLowerCase();
  
  return domains.some(domain => {
    if (domain.startsWith('@')) {
      return emailLower.endsWith(domain.toLowerCase());
    } else {
      return emailLower.endsWith(`@${domain.toLowerCase()}`);
    }
  });
}

export function validateEmailAllowlist(
  email: string, 
  allowedDomains?: string[]
): ValidationError | null {
  const emailValidation = validateEmailWithMessage(email);
  if (emailValidation) return emailValidation;
  
  if (!isAllowedDomain(email, allowedDomains)) {
    return { 
      field: 'email', 
      message: 'Email domain is not allowed. Please use a company or partner email address.' 
    };
  }
  
  return null;
}