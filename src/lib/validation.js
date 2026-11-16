import { QCU_ID_PATTERN, MIN_PASSWORD_LENGTH } from './constants.js';

/**
 * Standardized client-side validators matching backend Zod schemas.
 */

export function validateQcuId(value) {
  const clean = String(value || '').trim();
  if (!clean) {
    return { valid: false, error: 'QCU ID Number is required' };
  }
  if (!QCU_ID_PATTERN.test(clean)) {
    return { valid: false, error: 'Format must be YY-NNNN (e.g. 24-0001)' };
  }
  return { valid: true };
}

export function validateEmail(value) {
  const clean = String(value || '').trim();
  if (!clean) {
    return { valid: false, error: 'Email address is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(clean)) {
    return { valid: false, error: 'Enter a valid email address' };
  }
  return { valid: true };
}

export function validatePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  const isValid =
    (digits.length === 10 && digits.startsWith('9')) ||
    (digits.length === 11 && digits.startsWith('09')) ||
    (digits.length === 12 && digits.startsWith('639'));

  if (!isValid) {
    return {
      valid: false,
      error: 'Enter a valid 10-digit Philippine mobile number starting with 9 (e.g. 9XX XXX XXXX)',
    };
  }
  return { valid: true };
}

export function validatePassword(value, minLength = MIN_PASSWORD_LENGTH) {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: 'Password is required' };
  }
  if (value.length < minLength) {
    return {
      valid: false,
      error: `Password must be at least ${minLength} characters`,
    };
  }
  return { valid: true };
}

export function validateFullName(value, minLength = 2) {
  const clean = String(value || '').trim();
  if (!clean) {
    return { valid: false, error: 'Full name is required' };
  }
  if (clean.length < minLength) {
    return {
      valid: false,
      error: `Full name must be at least ${minLength} characters`,
    };
  }
  return { valid: true };
}

export function validateQuantity(value, { min = 1, max = 9999, stock } = {}) {
  const num = Number(value);
  if (!Number.isInteger(num)) {
    return { valid: false, error: 'Quantity must be an integer' };
  }
  if (num < min) {
    return { valid: false, error: `Quantity must be at least ${min}` };
  }
  if (num > max) {
    return { valid: false, error: `Quantity cannot exceed ${max}` };
  }
  if (typeof stock === 'number' && num > stock) {
    return { valid: false, error: `Only ${stock} items available in stock` };
  }
  return { valid: true };
}

export function validatePrice(value, { min = 0 } = {}) {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) {
    return { valid: false, error: 'Price must be a valid number' };
  }
  if (num < min) {
    return { valid: false, error: `Price cannot be less than ₱${min}` };
  }
  return { valid: true };
}
