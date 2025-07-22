/**
 * Formatting Utilities
 * Shared functions for formatting dates, numbers, currency, and text
 */

import { DATE_FORMATS, TIME_FORMATS, CURRENCIES } from '../constants/app';

// Date and time formatting
export function formatDate(
  date: string | Date,
  format: keyof typeof DATE_FORMATS = 'DISPLAY',
  locale: string = 'en-US'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const options: Intl.DateTimeFormatOptions = {};
  
  switch (format) {
    case 'SHORT':
      options.month = '2-digit';
      options.day = '2-digit';
      options.year = 'numeric';
      break;
    case 'LONG':
      options.month = 'long';
      options.day = 'numeric';
      options.year = 'numeric';
      break;
    case 'ISO':
      return dateObj.toISOString().split('T')[0];
    case 'DISPLAY':
      options.month = 'short';
      options.day = 'numeric';
      options.year = 'numeric';
      break;
    case 'COMPACT':
      options.month = 'numeric';
      options.day = 'numeric';
      options.year = '2-digit';
      break;
  }
  
  return dateObj.toLocaleDateString(locale, options);
}

export function formatTime(
  time: string | Date,
  format: keyof typeof TIME_FORMATS = '12H',
  locale: string = 'en-US'
): string {
  const dateObj = typeof time === 'string' ? new Date(time) : time;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Time';
  }
  
  const options: Intl.DateTimeFormatOptions = {};
  
  switch (format) {
    case '12H':
      options.hour = 'numeric';
      options.minute = '2-digit';
      options.hour12 = true;
      break;
    case '24H':
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.hour12 = false;
      break;
    case 'FULL_12H':
      options.hour = 'numeric';
      options.minute = '2-digit';
      options.second = '2-digit';
      options.hour12 = true;
      break;
    case 'FULL_24H':
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.second = '2-digit';
      options.hour12 = false;
      break;
  }
  
  return dateObj.toLocaleTimeString(locale, options);
}

export function formatDateTime(
  dateTime: string | Date,
  dateFormat: keyof typeof DATE_FORMATS = 'DISPLAY',
  timeFormat: keyof typeof TIME_FORMATS = '12H',
  locale: string = 'en-US'
): string {
  const formattedDate = formatDate(dateTime, dateFormat, locale);
  const formattedTime = formatTime(dateTime, timeFormat, locale);
  return `${formattedDate} at ${formattedTime}`;
}

// Relative time formatting
export function formatRelativeTime(
  date: string | Date,
  locale: string = 'en-US'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return formatDate(dateObj, 'DISPLAY', locale);
  }
}

// Duration formatting
export function formatDuration(
  startDate: string | Date,
  endDate: string | Date
): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const diffMs = end.getTime() - start.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (days === 1) {
    return '1 day';
  } else {
    return `${days} days`;
  }
}

// Currency formatting
export function formatCurrency(
  amount: number,
  currency: keyof typeof CURRENCIES = 'USD',
  locale: string = 'en-US',
  showSymbol: boolean = true
): string {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };
  
  if (!showSymbol) {
    options.style = 'decimal';
    options.minimumFractionDigits = 2;
    options.maximumFractionDigits = 2;
  }
  
  try {
    const formatted = new Intl.NumberFormat(locale, options).format(amount);
    return showSymbol ? formatted : `${formatted} ${currency}`;
  } catch (error) {
    // Fallback formatting
    return showSymbol ? `$${amount.toFixed(2)}` : `${amount.toFixed(2)} ${currency}`;
  }
}

// Number formatting
export function formatNumber(
  value: number,
  decimals: number = 0,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercentage(
  value: number,
  decimals: number = 1,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

// Phone number formatting
export function formatPhoneNumber(phone: string, format: 'us' | 'international' = 'us'): string {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  if (format === 'us') {
    // Format as (XXX) XXX-XXXX
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length === 11 && digits[0] === '1') {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
  } else {
    // Basic international formatting
    if (digits.length > 10) {
      return `+${digits.slice(0, digits.length - 10)} ${digits.slice(-10, -7)} ${digits.slice(-7, -4)} ${digits.slice(-4)}`;
    }
  }
  
  return phone; // Return original if can't format
}

// Text formatting
export function formatName(firstName?: string, lastName?: string): string {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.join(' ').trim();
}

export function formatInitials(firstName?: string, lastName?: string): string {
  const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
  return `${firstInitial}${lastInitial}`;
}

export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

export function capitalizeFirst(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function capitalizeWords(text: string): string {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ');
}

// URL/slug formatting
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Address formatting
export function formatAddress(address: {
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}): string {
  const parts = [
    address.street1,
    address.street2,
    [address.city, address.state].filter(Boolean).join(', '),
    address.postalCode,
    address.country
  ].filter(Boolean);
  
  return parts.join(', ');
}

// File size formatting
export function formatFileSize(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

// Color formatting
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Status formatting
export function formatStatus(status: string): string {
  return status
    .split('-')
    .map(word => capitalizeFirst(word))
    .join(' ');
}

export function formatEnumValue(value: string): string {
  return value
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ');
}