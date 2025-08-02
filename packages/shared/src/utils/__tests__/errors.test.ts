/**
 * Error Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import {
  AppError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  ERROR_CODES,
  isOperationalError,
  createErrorResponse,
  formatValidationErrors,
  handleAsyncError,
  safeJsonParse,
  retryWithBackoff,
} from '../errors';

describe('AppError', () => {
  it('should create error with correct properties', () => {
    const error = new AppError('TEST_CODE', 'Test message', 400);
    
    expect(error.code).toBe('TEST_CODE');
    expect(error.message).toBe('Test message');
    expect(error.statusCode).toBe(400);
    expect(error.isOperational).toBe(true);
    expect(error.name).toBe('AppError');
  });

  it('should have default status code', () => {
    const error = new AppError('TEST_CODE', 'Test message');
    expect(error.statusCode).toBe(500);
  });
});

describe('AuthenticationError', () => {
  it('should create authentication error', () => {
    const error = new AuthenticationError();
    
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('AUTH_FAILED');
    expect(error.name).toBe('AuthenticationError');
  });

  it('should allow custom message and code', () => {
    const error = new AuthenticationError('Custom message', 'CUSTOM_CODE');
    
    expect(error.message).toBe('Custom message');
    expect(error.code).toBe('CUSTOM_CODE');
  });
});

describe('ValidationError', () => {
  it('should create validation error with field', () => {
    const error = new ValidationError('Invalid email', 'email');
    
    expect(error.statusCode).toBe(400);
    expect(error.field).toBe('email');
    expect(error.message).toBe('Invalid email');
    expect(error.name).toBe('ValidationError');
  });
});

describe('NotFoundError', () => {
  it('should create not found error', () => {
    const error = new NotFoundError('User');
    
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('User not found');
    expect(error.name).toBe('NotFoundError');
  });
});

describe('isOperationalError', () => {
  it('should identify operational errors', () => {
    const appError = new AppError('TEST', 'Test', 400, true);
    const authError = new AuthenticationError();
    const regularError = new Error('Regular error');
    
    expect(isOperationalError(appError)).toBe(true);
    expect(isOperationalError(authError)).toBe(true);
    expect(isOperationalError(regularError)).toBe(false);
  });

  it('should identify non-operational errors', () => {
    const appError = new AppError('TEST', 'Test', 500, false);
    expect(isOperationalError(appError)).toBe(false);
  });
});

describe('createErrorResponse', () => {
  it('should create error response from AppError', () => {
    const error = new AppError('TEST_CODE', 'Test message', 400);
    const response = createErrorResponse(error, '/api/test');
    
    expect(response.code).toBe('TEST_CODE');
    expect(response.message).toBe('Test message');
    expect(response.statusCode).toBe(400);
    expect(response.path).toBe('/api/test');
    expect(response.timestamp).toBeDefined();
  });

  it('should create error response from regular Error', () => {
    const error = new Error('Regular error');
    const response = createErrorResponse(error);
    
    expect(response.code).toBe(ERROR_CODES.INTERNAL_ERROR);
    expect(response.statusCode).toBe(500);
    expect(response.message).toBe('Regular error');
  });
});

describe('formatValidationErrors', () => {
  it('should format validation errors by field', () => {
    const errors = [
      new ValidationError('Email is required', 'email'),
      new ValidationError('Email is invalid', 'email'),
      new ValidationError('Name is required', 'name'),
    ];
    
    const formatted = formatValidationErrors(errors);
    
    expect(formatted.email).toHaveLength(2);
    expect(formatted.name).toHaveLength(1);
    expect(formatted.email).toContain('Email is required');
    expect(formatted.email).toContain('Email is invalid');
  });

  it('should handle errors without field', () => {
    const errors = [new ValidationError('General error')];
    const formatted = formatValidationErrors(errors);
    
    expect(formatted.general).toHaveLength(1);
    expect(formatted.general[0]).toBe('General error');
  });
});

describe('handleAsyncError', () => {
  it('should handle successful promise', async () => {
    const successPromise = Promise.resolve('success');
    const [error, result] = await handleAsyncError(successPromise);
    
    expect(error).toBeNull();
    expect(result).toBe('success');
  });

  it('should handle rejected promise', async () => {
    const failurePromise = Promise.reject(new Error('failure'));
    const [error, result] = await handleAsyncError(failurePromise);
    
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe('failure');
    expect(result).toBeNull();
  });
});

describe('safeJsonParse', () => {
  it('should parse valid JSON', () => {
    const [error, result] = safeJsonParse('{"test": "value"}');
    
    expect(error).toBeNull();
    expect(result).toEqual({ test: 'value' });
  });

  it('should handle invalid JSON', () => {
    const [error, result] = safeJsonParse('invalid json');
    
    expect(error).toBeInstanceOf(Error);
    expect(result).toBeNull();
  });

  it('should handle empty string', () => {
    const [error, result] = safeJsonParse('');
    
    expect(error).toBeInstanceOf(Error);
    expect(result).toBeNull();
  });
});

describe('retryWithBackoff', () => {
  it('should succeed on first attempt', async () => {
    let attempts = 0;
    const operation = async () => {
      attempts++;
      return 'success';
    };
    
    const result = await retryWithBackoff(operation, 3, 100);
    
    expect(result).toBe('success');
    expect(attempts).toBe(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    let attempts = 0;
    const operation = async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error(`fail ${attempts}`);
      }
      return 'success';
    };
    
    const result = await retryWithBackoff(operation, 3, 10);
    
    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });

  it('should throw error after max retries', async () => {
    let attempts = 0;
    const operation = async () => {
      attempts++;
      throw new Error('persistent failure');
    };
    
    await expect(retryWithBackoff(operation, 2, 10)).rejects.toThrow('persistent failure');
    expect(attempts).toBe(3); // initial + 2 retries
  });
});