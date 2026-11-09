// API Endpoints
export const API_ENDPOINTS = {
  AUTH: '/auth',
  MARKETPLACE: '/marketplace',
  ORDERS: '/orders',
  ADMIN: '/admin',
};

// User Roles
export const USER_ROLES = {
  BUYER: 'BUYER',
  SELLER: 'SELLER',
  ADMIN: 'ADMIN',
};

// QCU Member Types
export const MEMBER_TYPES = {
  STUDENT: 'STUDENT',
  FACULTY: 'FACULTY',
  STAFF: 'STAFF',
};

// Verification Status
export const VERIFICATION_STATUS = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
};

// Seller Types
export const SELLER_TYPES = {
  STUDENT_ENTERPRISE: 'STUDENT_ENTERPRISE',
  RECOGNIZED_ORGANIZATION: 'RECOGNIZED_ORGANIZATION',
  INDEPENDENT_SELLER: 'INDEPENDENT_SELLER',
};

// Order Status
export const ORDER_STATUS = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PENDING_CONFIRMATION: 'PENDING_CONFIRMATION',
  PREPARING: 'PREPARING',
  READY_FOR_PICKUP: 'READY_FOR_PICKUP',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'CASH',
  GCASH_PAYMONGO: 'GCASH_PAYMONGO',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
};

// Complaint Status
export const COMPLAINT_STATUS = {
  OPEN: 'OPEN',
  UNDER_REVIEW: 'UNDER_REVIEW',
  RESOLVED: 'RESOLVED',
  DISMISSED: 'DISMISSED',
};

// Product sort options accepted by GET /marketplace/products
export const PRODUCT_SORT = {
  NEWEST: 'newest',
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
};

// Validation rules mirrored from bizzyqcu-server (auth.validation.ts)
export const QCU_ID_PATTERN = /^\d{2}-\d{4}$/; // YY-NNNN, e.g. 24-1685
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Formats a student ID into the strict QCU format: YY-NNNN (e.g. 24-1685).
 * Restricts input to numeric digits and automatically manages the hyphen.
 * Capped strictly at 7 characters (2 digits, hyphen, 4 digits).
 */
export function formatStudentId(value, prevValue = '') {
  if (!value) return '';
  if (value.length < prevValue.length && value.endsWith('-')) {
    return value.slice(0, -1);
  }
  const digits = value.replace(/\D/g, '').slice(0, 6);
  if (digits.length < 2) return digits;
  if (digits.length === 2) {
    return value.endsWith('-') ? `${digits}-` : digits;
  }
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
}

// Delivery Methods
export const DELIVERY_METHODS = {
  ROOM_TO_ROOM: 'ROOM_TO_ROOM',
  PICKUP: 'PICKUP',
};
