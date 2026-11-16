import { SELLER_TYPES } from '../../../lib/constants.js'

/**
 * Determine the post-login destination URL for a user logging into the seller portal.
 *
 * @param {object} user - The authenticated user object
 * @param {string} [fallbackSellerType] - Fallback seller type from portal selection
 * @returns {string} Route destination
 */
export function destinationFor(user, fallbackSellerType) {
  if (user?.role === 'ADMIN') {
    return '/admin'
  }

  // Check if seller account or has seller profile / seller type / portal fallback.
  // Pending/unapproved sellers are still directed to their seller dashboard,
  // where an "Account Waiting for Approval" notice is displayed.
  if (user?.role === 'SELLER' || user?.sellerProfile || user?.sellerType || fallbackSellerType) {
    const rawType =
      user?.sellerProfile?.sellerType ||
      user?.sellerType ||
      user?.type ||
      fallbackSellerType

    const normalized = String(rawType || '').toUpperCase()

    // Organization Seller -> /seller/org/dashboard
    if (
      normalized === SELLER_TYPES.RECOGNIZED_ORGANIZATION ||
      normalized === 'ORGANIZATION' ||
      normalized.includes('ORGANIZATION')
    ) {
      return '/seller/org/dashboard'
    }

    // Enterprise Seller -> /seller/dashboard
    if (
      normalized === SELLER_TYPES.STUDENT_ENTERPRISE ||
      normalized === 'ENTERPRISE' ||
      normalized === 'ENTREPRENEUR' ||
      normalized.includes('ENTERPRISE') ||
      normalized.includes('ENTREPRENEUR')
    ) {
      return '/seller/dashboard'
    }

    // Independent Seller -> /seller/dashboard
    if (
      normalized === SELLER_TYPES.INDEPENDENT_SELLER ||
      normalized === 'INDIVIDUAL' ||
      normalized === 'INDEPENDENT' ||
      normalized.includes('INDEPENDENT') ||
      normalized.includes('INDIVIDUAL')
    ) {
      return '/seller/dashboard'
    }

    // Any other seller default -> /seller/dashboard
    return '/seller/dashboard'
  }

  // Non-verified or buyer fallback -> /account
  return '/account'
}
