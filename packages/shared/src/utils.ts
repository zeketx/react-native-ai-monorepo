// ClientSync Travel Platform - Shared Utility Functions

import { 
  ClientTier, 
  Trip, 
  TripStatus,
  ApiResponse,
  ValidationError 
} from './types.js'
import { 
  FLIGHT_CLASSES_BY_TIER, 
  HOTEL_CATEGORIES_BY_TIER, 
  TRIP_DURATION_LIMITS_BY_TIER,
  VALIDATION,
  ERROR_MESSAGES,
  DATE_FORMATS
} from './constants.js'

// ================================
// Tier-Based Utilities
// ================================

export function getAvailableFlightClasses(tier: ClientTier): readonly string[] {
  return FLIGHT_CLASSES_BY_TIER[tier] || []
}

export function getAvailableHotelCategories(tier: ClientTier): readonly string[] {
  return HOTEL_CATEGORIES_BY_TIER[tier] || []
}

export function getMaxTripDuration(tier: ClientTier): number {
  return TRIP_DURATION_LIMITS_BY_TIER[tier] || 7
}

export function canAccessTier(userTier: ClientTier, requiredTier: ClientTier): boolean {
  const tierOrder = [ClientTier.STANDARD, ClientTier.PREMIUM, ClientTier.ELITE]
  const userIndex = tierOrder.indexOf(userTier)
  const requiredIndex = tierOrder.indexOf(requiredTier)
  return userIndex >= requiredIndex
}

export function getTierDisplayName(tier: ClientTier): string {
  const displayNames = {
    [ClientTier.STANDARD]: 'Standard',
    [ClientTier.PREMIUM]: 'Premium',
    [ClientTier.ELITE]: 'Elite'
  }
  return displayNames[tier] || tier
}

// ================================
// Date & Time Utilities
// ================================

export function formatDate(date: string | Date, format?: string): string {
  const d = new Date(date)
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date'
  }

  // Simple format implementation - in production, use date-fns or dayjs
  switch (format || DATE_FORMATS.DISPLAY_DATE) {
    case DATE_FORMATS.API_DATE:
      return d.toISOString().split('T')[0]
    
    case DATE_FORMATS.TIME_ONLY:
      return d.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    
    case DATE_FORMATS.DISPLAY_DATETIME:
      return d.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    
    default:
      return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
  }
}

export function calculateTripDuration(startDate: string | Date, endDate: string | Date): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getDaysUntilTrip(tripDate: string | Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const trip = new Date(tripDate)
  trip.setHours(0, 0, 0, 0)
  const diffTime = trip.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function isDateInPast(date: string | Date): boolean {
  return new Date(date) < new Date()
}

export function isDateRangeValid(startDate: string | Date, endDate: string | Date): boolean {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return start < end
}

// ================================
// Validation Utilities
// ================================

export function isValidEmail(email: string): boolean {
  return VALIDATION.EMAIL_REGEX.test(email)
}

export function isValidPhone(phone: string): boolean {
  return VALIDATION.PHONE_REGEX.test(phone)
}

export function isValidName(name: string): boolean {
  return VALIDATION.NAME_REGEX.test(name) && 
         name.length >= VALIDATION.MIN_NAME_LENGTH && 
         name.length <= VALIDATION.MAX_NAME_LENGTH
}

export function isValidPassword(password: string): boolean {
  return password.length >= VALIDATION.MIN_PASSWORD_LENGTH && 
         password.length <= VALIDATION.MAX_PASSWORD_LENGTH
}

export function validateEmail(email: string): ValidationError | null {
  if (!email) {
    return { field: 'email', message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD, code: 'REQUIRED' }
  }
  if (!isValidEmail(email)) {
    return { field: 'email', message: ERROR_MESSAGES.VALIDATION.INVALID_EMAIL, code: 'INVALID' }
  }
  if (email.length > VALIDATION.MAX_EMAIL_LENGTH) {
    return { field: 'email', message: 'Email is too long', code: 'TOO_LONG' }
  }
  return null
}

export function validatePhone(phone: string): ValidationError | null {
  if (!phone) {
    return { field: 'phone', message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD, code: 'REQUIRED' }
  }
  if (!isValidPhone(phone)) {
    return { field: 'phone', message: ERROR_MESSAGES.VALIDATION.INVALID_PHONE, code: 'INVALID' }
  }
  return null
}

// ================================
// String Utilities
// ================================

export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Format based on length (assuming US/CA numbers for now)
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  
  // Return with + if it looks like an international number
  return cleaned.length > 10 ? `+${cleaned}` : phone
}

export function truncateText(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - suffix.length) + suffix
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// ================================
// Array & Object Utilities
// ================================

export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set()
  return array.filter(item => {
    const value = item[key]
    if (seen.has(value)) return false
    seen.add(value)
    return true
  })
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const value = String(item[key])
    groups[value] = groups[value] || []
    groups[value].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj }
  keys.forEach(key => {
    delete result[key]
  })
  return result as Omit<T, K>
}

// ================================
// Trip Utilities
// ================================

export function getTripStatusColor(status: TripStatus): string {
  const colors = {
    [TripStatus.PLANNING]: '#FFA502',
    [TripStatus.CONFIRMED]: '#00D2D3',
    [TripStatus.IN_PROGRESS]: '#54A0FF',
    [TripStatus.COMPLETED]: '#00D757',
    [TripStatus.CANCELLED]: '#FF6B6B'
  }
  return colors[status] || '#666666'
}

export function getTripStatusDisplayName(status: TripStatus): string {
  const displayNames = {
    [TripStatus.PLANNING]: 'Planning',
    [TripStatus.CONFIRMED]: 'Confirmed',
    [TripStatus.IN_PROGRESS]: 'In Progress',
    [TripStatus.COMPLETED]: 'Completed',
    [TripStatus.CANCELLED]: 'Cancelled'
  }
  return displayNames[status] || status
}

export function canModifyTrip(trip: Trip): boolean {
  return trip.status === TripStatus.PLANNING || trip.status === TripStatus.CONFIRMED
}

export function isTripActive(trip: Trip): boolean {
  return trip.status !== TripStatus.COMPLETED && trip.status !== TripStatus.CANCELLED
}

// ================================
// Error Handling
// ================================

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'ApiError'
    Object.setPrototypeOf(this, ApiError.prototype)
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      details: this.details
    }
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function createApiResponse<T>(
  data?: T, 
  error?: { code: string; message: string; details?: Record<string, any> }
): ApiResponse<T> {
  if (error) {
    return {
      success: false,
      error
    }
  }
  return {
    success: true,
    data
  }
}

// ================================
// Formatting Utilities
// ================================

export function formatCurrency(
  amount: number, 
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount)
}

export function formatPercentage(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`
}

export function formatNumber(
  value: number,
  locale = 'en-US',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value)
}

// ================================
// Async Utilities
// ================================

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    attempts?: number
    delay?: number
    onError?: (error: Error, attempt: number) => void
  } = {}
): Promise<T> {
  const { attempts = 3, delay: delayMs = 1000, onError } = options
  
  let lastError: Error
  
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      onError?.(lastError, i + 1)
      
      if (i < attempts - 1) {
        await delay(delayMs * Math.pow(2, i)) // Exponential backoff
      }
    }
  }
  
  throw lastError!
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    
    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delayMs)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= limitMs) {
      lastCall = now
      fn(...args)
    }
  }
}