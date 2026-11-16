/**
 * Centralized Input Sanitization Module for BizzyQCU
 */

/**
 * Strips dangerous HTML tags, script blocks, null bytes, and control characters.
 * Trims whitespace and optionally truncates to maxLength.
 *
 * @param {any} str - Input value
 * @param {number} [maxLength] - Optional maximum string length
 * @returns {string} Sanitized string
 */
export function sanitizeText(str, maxLength) {
  if (str === null || str === undefined) return '';
  let s = String(str);

  // Strip null bytes and control characters (preserving tab \t, newline \n, CR \r)
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Strip script, style, and iframe tags along with their inner contents
  s = s.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  s = s.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  s = s.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // Strip remaining HTML tags
  s = s.replace(/<[^>]*>/g, '');

  // Trim whitespace
  s = s.trim();

  // Enforce max length if specified
  if (typeof maxLength === 'number' && maxLength >= 0) {
    s = s.slice(0, maxLength);
  }

  return s;
}

/**
 * Extracts digits and normalizes to Philippine mobile format.
 * Returns 11-digit national format: 09XXXXXXXXX (or digits if empty/other).
 *
 * @param {any} str - Raw phone input
 * @returns {string} Canonical phone number
 */
export function sanitizePhone(str) {
  if (!str) return '';
  const digits = String(str).replace(/\D/g, '');

  // If starts with 639 and has 12 digits -> 09XXXXXXXXX
  if (digits.startsWith('639') && digits.length === 12) {
    return '0' + digits.slice(2);
  }
  // If starts with 9 and has 10 digits -> 09XXXXXXXXX
  if (digits.startsWith('9') && digits.length === 10) {
    return '0' + digits;
  }
  // If starts with 09 and has 11 digits -> 09XXXXXXXXX
  if (digits.startsWith('09') && digits.length === 11) {
    return digits;
  }

  return digits;
}

/**
 * Formats a 10-digit mobile number for display: 9XX XXX XXXX
 *
 * @param {any} str
 * @returns {string}
 */
export function formatPhoneNational(str) {
  const digits = String(str || '').replace(/\D/g, '');
  let body = '';
  if (digits.startsWith('639') && digits.length >= 12) {
    body = digits.slice(2, 12);
  } else if (digits.startsWith('09') && digits.length >= 11) {
    body = digits.slice(1, 11);
  } else if (digits.startsWith('9')) {
    body = digits.slice(0, 10);
  } else {
    body = digits.slice(0, 10);
  }
  return [body.slice(0, 3), body.slice(3, 6), body.slice(6, 10)].filter(Boolean).join(' ');
}

/**
 * Normalizes QCU ID into strict YY-NNNN pattern.
 *
 * @param {any} str
 * @returns {string}
 */
export function sanitizeQcuId(str) {
  if (!str) return '';
  const digits = String(str).replace(/\D/g, '').slice(0, 6);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
}

/**
 * Sanitizes numeric input within given min/max bounds.
 *
 * @param {any} val - Input value
 * @param {object} [options]
 * @param {number} [options.min]
 * @param {number} [options.max]
 * @param {number} [options.defaultVal=0]
 * @param {boolean} [options.integer=false]
 * @returns {number}
 */
export function sanitizeNumeric(val, { min, max, defaultVal = 0, integer = false } = {}) {
  let num = typeof val === 'number' ? val : Number(val);
  if (isNaN(num) || !isFinite(num)) {
    return defaultVal;
  }
  if (integer) {
    num = Math.floor(num);
  }
  if (typeof min === 'number' && num < min) {
    num = min;
  }
  if (typeof max === 'number' && num > max) {
    num = max;
  }
  return num;
}

/**
 * Recursively sanitizes object and array payloads for API submission.
 * Skips binary instances (FormData, Blob, ArrayBuffer) and password fields.
 *
 * @param {any} payload
 * @param {object} [options]
 * @param {string[]} [options.skipKeys]
 * @returns {any}
 */
export function sanitizePayload(payload, options = {}) {
  if (payload === null || payload === undefined) return payload;

  // Skip FormData, Blob, File, ArrayBuffer, Date, RegExp
  if (typeof FormData !== 'undefined' && payload instanceof FormData) return payload;
  if (typeof Blob !== 'undefined' && payload instanceof Blob) return payload;
  if (typeof ArrayBuffer !== 'undefined' && payload instanceof ArrayBuffer) return payload;
  if (payload instanceof Date || payload instanceof RegExp) return payload;

  if (typeof payload === 'string') {
    return sanitizeText(payload);
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => sanitizePayload(item, options));
  }

  if (typeof payload === 'object') {
    const sanitized = {};
    const skipKeys = options.skipKeys || [
      'password',
      'confirmPassword',
      'newPassword',
      'currentPassword',
      'oldPassword',
    ];

    for (const [key, value] of Object.entries(payload)) {
      if (skipKeys.includes(key)) {
        sanitized[key] = value;
      } else {
        sanitized[key] = sanitizePayload(value, options);
      }
    }
    return sanitized;
  }

  return payload;
}
