/**
 * Validation utilities for API endpoints
 */

export interface ValidationError {
  field: string
  message: string
  code: string
}

export class ValidationResult {
  public errors: ValidationError[] = []

  get isValid(): boolean {
    return this.errors.length === 0
  }

  addError(field: string, message: string, code: string = 'VALIDATION_ERROR') {
    this.errors.push({ field, message, code })
  }

  getErrorResponse() {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Validation failed',
        message: 'Please check the provided data',
        validationErrors: this.errors
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

/**
 * Email validation
 */
export function validateEmail(email: string): ValidationError | null {
  if (!email) {
    return { field: 'email', message: 'Email is required', code: 'REQUIRED' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { field: 'email', message: 'Invalid email format', code: 'INVALID_FORMAT' }
  }

  if (email.length > 254) {
    return { field: 'email', message: 'Email is too long (max 254 characters)', code: 'TOO_LONG' }
  }

  return null
}

/**
 * Password validation
 */
export function validatePassword(password: string): ValidationError | null {
  if (!password) {
    return { field: 'password', message: 'Password is required', code: 'REQUIRED' }
  }

  if (password.length < 8) {
    return { field: 'password', message: 'Password must be at least 8 characters long', code: 'TOO_SHORT' }
  }

  if (password.length > 128) {
    return { field: 'password', message: 'Password is too long (max 128 characters)', code: 'TOO_LONG' }
  }

  // Check for at least one letter and one number
  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    return { 
      field: 'password', 
      message: 'Password must contain at least one letter and one number', 
      code: 'WEAK_PASSWORD' 
    }
  }

  return null
}

/**
 * Required field validation
 */
export function validateRequired(value: any, fieldName: string): ValidationError | null {
  if (value === undefined || value === null || value === '') {
    return { field: fieldName, message: `${fieldName} is required`, code: 'REQUIRED' }
  }
  return null
}

/**
 * String length validation
 */
export function validateStringLength(
  value: string, 
  fieldName: string, 
  min?: number, 
  max?: number
): ValidationError | null {
  if (!value) {
    return null // Use validateRequired for required checks
  }

  if (min !== undefined && value.length < min) {
    return { 
      field: fieldName, 
      message: `${fieldName} must be at least ${min} characters long`, 
      code: 'TOO_SHORT' 
    }
  }

  if (max !== undefined && value.length > max) {
    return { 
      field: fieldName, 
      message: `${fieldName} must be no more than ${max} characters long`, 
      code: 'TOO_LONG' 
    }
  }

  return null
}

/**
 * Date validation
 */
export function validateDate(dateString: string, fieldName: string): ValidationError | null {
  if (!dateString) {
    return null // Use validateRequired for required checks
  }

  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return { field: fieldName, message: `${fieldName} must be a valid date`, code: 'INVALID_DATE' }
  }

  return null
}

/**
 * Date range validation
 */
export function validateDateRange(
  startDate: string, 
  endDate: string, 
  allowPastDates: boolean = true
): ValidationError[] {
  const errors: ValidationError[] = []
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  const now = new Date()

  if (isNaN(start.getTime())) {
    errors.push({ field: 'startDate', message: 'Start date must be a valid date', code: 'INVALID_DATE' })
  }

  if (isNaN(end.getTime())) {
    errors.push({ field: 'endDate', message: 'End date must be a valid date', code: 'INVALID_DATE' })
  }

  if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
    if (start >= end) {
      errors.push({ 
        field: 'endDate', 
        message: 'End date must be after start date', 
        code: 'INVALID_RANGE' 
      })
    }

    if (!allowPastDates && start < now) {
      errors.push({ 
        field: 'startDate', 
        message: 'Start date cannot be in the past', 
        code: 'PAST_DATE' 
      })
    }
  }

  return errors
}

/**
 * Enum validation
 */
export function validateEnum<T extends string>(
  value: string, 
  validValues: T[], 
  fieldName: string
): ValidationError | null {
  if (!value) {
    return null // Use validateRequired for required checks
  }

  if (!validValues.includes(value as T)) {
    return { 
      field: fieldName, 
      message: `${fieldName} must be one of: ${validValues.join(', ')}`, 
      code: 'INVALID_VALUE' 
    }
  }

  return null
}

/**
 * UUID validation
 */
export function validateUUID(value: string, fieldName: string): ValidationError | null {
  if (!value) {
    return null // Use validateRequired for required checks
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(value)) {
    return { field: fieldName, message: `${fieldName} must be a valid UUID`, code: 'INVALID_UUID' }
  }

  return null
}

/**
 * Comprehensive validation helper
 */
export function validate(validations: (() => ValidationError | ValidationError[] | null)[]): ValidationResult {
  const result = new ValidationResult()

  for (const validation of validations) {
    const error = validation()
    if (error) {
      if (Array.isArray(error)) {
        result.errors.push(...error)
      } else {
        result.errors.push(error)
      }
    }
  }

  return result
}

/**
 * Sanitization utilities
 */
export const sanitize = {
  /**
   * Remove HTML tags and trim whitespace
   */
  text: (input: string): string => {
    if (!input) return ''
    return input.replace(/<[^>]*>/g, '').trim()
  },

  /**
   * Normalize email address
   */
  email: (input: string): string => {
    if (!input) return ''
    return input.toLowerCase().trim()
  },

  /**
   * Remove non-alphanumeric characters except specified ones
   */
  alphanumeric: (input: string, allowed: string = ''): string => {
    if (!input) return ''
    const pattern = new RegExp(`[^a-zA-Z0-9${allowed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`, 'g')
    return input.replace(pattern, '')
  },

  /**
   * Limit string length
   */
  maxLength: (input: string, maxLength: number): string => {
    if (!input) return ''
    return input.slice(0, maxLength)
  }
}