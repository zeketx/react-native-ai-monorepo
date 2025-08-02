/**
 * Validation Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  isAllowedDomain,
  validateEmailAllowlist,
  validatePhone,
  validateName,
  validateDate,
  validateForm,
} from '../validation';

describe('validateEmail', () => {
  it('should validate correct email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    expect(validateEmail('valid.email@subdomain.domain.com')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('missing@domain')).toBe(false);
    expect(validateEmail('@missing-user.com')).toBe(false);
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(validateEmail(null as any)).toBe(false);
    expect(validateEmail(undefined as any)).toBe(false);
    expect(validateEmail(123 as any)).toBe(false);
  });
});

describe('validatePassword', () => {
  it('should validate strong passwords', () => {
    const result = validatePassword('StrongPass123!');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject weak passwords', () => {
    const result = validatePassword('weak');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should identify specific password requirements', () => {
    const result = validatePassword('lowercase123!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one uppercase letter');
  });

  it('should require minimum length', () => {
    const result = validatePassword('Sh0rt!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters long');
  });
});

describe('isAllowedDomain', () => {
  const allowedDomains = ['@clientsync.com', '@partner.com', 'enterprise.com'];

  it('should allow emails from permitted domains', () => {
    expect(isAllowedDomain('user@clientsync.com', allowedDomains)).toBe(true);
    expect(isAllowedDomain('test@partner.com', allowedDomains)).toBe(true);
    expect(isAllowedDomain('admin@enterprise.com', allowedDomains)).toBe(true);
  });

  it('should reject emails from non-permitted domains', () => {
    expect(isAllowedDomain('user@gmail.com', allowedDomains)).toBe(false);
    expect(isAllowedDomain('test@yahoo.com', allowedDomains)).toBe(false);
  });

  it('should use default domains when none provided', () => {
    expect(isAllowedDomain('user@clientsync.com')).toBe(true);
    expect(isAllowedDomain('user@gmail.com')).toBe(false);
  });

  it('should handle invalid emails', () => {
    expect(isAllowedDomain('invalid-email', allowedDomains)).toBe(false);
  });
});

describe('validatePhone', () => {
  it('should validate US phone numbers', () => {
    expect(validatePhone('(555) 123-4567')).toBe(true);
    expect(validatePhone('555-123-4567')).toBe(true);
    expect(validatePhone('5551234567')).toBe(true);
    expect(validatePhone('+1 555 123 4567')).toBe(true);
  });

  it('should validate international phone numbers', () => {
    expect(validatePhone('+44 20 7946 0958', 'international')).toBe(true);
    expect(validatePhone('+81 3 1234 5678', 'international')).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(validatePhone('invalid-phone')).toBe(false);
    expect(validatePhone('123')).toBe(false);
    expect(validatePhone('')).toBe(false);
  });
});

describe('validateName', () => {
  it('should validate proper names', () => {
    const result = validateName('John Doe');
    expect(result).toBeNull();
  });

  it('should reject empty names', () => {
    const result = validateName('');
    expect(result).not.toBeNull();
    expect(result?.message).toContain('required');
  });

  it('should reject names with invalid characters', () => {
    const result = validateName('John123');
    expect(result).not.toBeNull();
    expect(result?.message).toContain('letters, spaces, hyphens, and apostrophes');
  });

  it('should handle names with apostrophes and hyphens', () => {
    expect(validateName("O'Connor")).toBeNull();
    expect(validateName("Mary-Jane")).toBeNull();
  });
});

describe('validateDate', () => {
  it('should validate proper date strings', () => {
    expect(validateDate('2023-12-31')).toBe(true);
    expect(validateDate('2023/12/31')).toBe(true);
    expect(validateDate('Dec 31, 2023')).toBe(true);
  });

  it('should reject invalid dates', () => {
    expect(validateDate('invalid-date')).toBe(false);
    expect(validateDate('')).toBe(false);
    expect(validateDate('2023-13-45')).toBe(false);
  });
});

describe('validateForm', () => {
  it('should validate all fields according to rules', () => {
    const data = {
      email: 'test@example.com',
      name: 'John Doe',
      age: 25
    };

    const rules = {
      email: [(value: any) => validateEmail(value) ? null : { field: 'email', message: 'Invalid email' }],
      name: [(value: any) => validateName(value)],
      age: [(value: any) => value >= 18 ? null : { field: 'age', message: 'Must be 18 or older' }]
    };

    const errors = validateForm(data, rules);
    expect(errors).toHaveLength(0);
  });

  it('should return errors for invalid data', () => {
    const data = {
      email: 'invalid-email',
      name: '',
      age: 16
    };

    const rules = {
      email: [(value: any) => validateEmail(value) ? null : { field: 'email', message: 'Invalid email' }],
      name: [(value: any) => validateName(value)],
      age: [(value: any) => value >= 18 ? null : { field: 'age', message: 'Must be 18 or older' }]
    };

    const errors = validateForm(data, rules);
    expect(errors.length).toBeGreaterThan(0);
  });
});