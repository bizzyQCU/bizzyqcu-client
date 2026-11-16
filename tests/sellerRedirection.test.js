import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { destinationFor } from '../src/subsystems/auth/utils/sellerRedirect.js'
import { SELLER_TYPES, USER_ROLES, VERIFICATION_STATUS } from '../src/lib/constants.js'

describe('Seller Login Redirection Suite', () => {
  describe('Organization Seller Redirection (R2)', () => {
    it('redirects verified Organization Seller with RECOGNIZED_ORGANIZATION enum in sellerProfile to /seller/org/dashboard', () => {
      const user = {
        role: USER_ROLES.SELLER,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        sellerProfile: {
          sellerType: SELLER_TYPES.RECOGNIZED_ORGANIZATION,
        },
      }
      assert.strictEqual(destinationFor(user), '/seller/org/dashboard')
    })

    it('redirects verified Organization Seller with sellerType property on root user to /seller/org/dashboard', () => {
      const user = {
        role: USER_ROLES.SELLER,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        sellerType: SELLER_TYPES.RECOGNIZED_ORGANIZATION,
      }
      assert.strictEqual(destinationFor(user), '/seller/org/dashboard')
    })

    it('redirects organization seller with lowercase "organization" string to /seller/org/dashboard', () => {
      const user = {
        role: USER_ROLES.SELLER,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        sellerType: 'organization',
      }
      assert.strictEqual(destinationFor(user), '/seller/org/dashboard')
    })

    it('redirects organization seller when sellerProfile has lowercase type to /seller/org/dashboard', () => {
      const user = {
        role: USER_ROLES.SELLER,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        sellerProfile: {
          sellerType: 'organization',
        },
      }
      assert.strictEqual(destinationFor(user), '/seller/org/dashboard')
    })
  })

  describe('Enterprise Seller Redirection (R3)', () => {
    it('redirects verified Enterprise Seller with STUDENT_ENTERPRISE enum to /seller/dashboard', () => {
      const user = {
        role: USER_ROLES.SELLER,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        sellerProfile: {
          sellerType: SELLER_TYPES.STUDENT_ENTERPRISE,
        },
      }
      assert.strictEqual(destinationFor(user), '/seller/dashboard')
    })

    it('redirects verified Enterprise Seller with root sellerType to /seller/dashboard', () => {
      const user = {
        role: USER_ROLES.SELLER,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        sellerType: 'STUDENT_ENTERPRISE',
      }
      assert.strictEqual(destinationFor(user), '/seller/dashboard')
    })

    it('redirects enterprise seller with "enterprise" string to /seller/dashboard', () => {
      const user = {
        role: USER_ROLES.SELLER,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        sellerType: 'enterprise',
      }
      assert.strictEqual(destinationFor(user), '/seller/dashboard')
    })

    it('redirects enterprise seller with "entrepreneur" string to /seller/dashboard', () => {
      const user = {
        role: USER_ROLES.SELLER,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        sellerType: 'entrepreneur',
      }
      assert.strictEqual(destinationFor(user), '/seller/dashboard')
    })
  })

  describe('Independent Seller Redirection (R3)', () => {
    it('redirects verified Independent Seller with INDEPENDENT_SELLER enum to /seller/dashboard', () => {
      const user = {
        role: USER_ROLES.SELLER,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        sellerProfile: {
          sellerType: SELLER_TYPES.INDEPENDENT_SELLER,
        },
      }
      assert.strictEqual(destinationFor(user), '/seller/dashboard')
    })

    it('redirects verified Independent Seller with root sellerType to /seller/dashboard', () => {
      const user = {
        role: USER_ROLES.SELLER,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        sellerType: 'INDEPENDENT_SELLER',
      }
      assert.strictEqual(destinationFor(user), '/seller/dashboard')
    })

    it('redirects independent seller with "individual" string to /seller/dashboard', () => {
      const user = {
        role: USER_ROLES.SELLER,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        sellerType: 'individual',
      }
      assert.strictEqual(destinationFor(user), '/seller/dashboard')
    })

    it('redirects independent seller with "independent" string to /seller/dashboard', () => {
      const user = {
        role: USER_ROLES.SELLER,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        sellerType: 'independent',
      }
      assert.strictEqual(destinationFor(user), '/seller/dashboard')
    })
  })

  describe('Other Seller Defaults', () => {
    it('redirects seller with unknown/unspecified sellerType to default /seller/dashboard', () => {
      const user = {
        role: USER_ROLES.SELLER,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
      }
      assert.strictEqual(destinationFor(user), '/seller/dashboard')
    })

    it('redirects seller with custom seller type to default /seller/dashboard', () => {
      const user = {
        role: USER_ROLES.SELLER,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        sellerType: 'CUSTOM_STUDENT_MERCHANT',
      }
      assert.strictEqual(destinationFor(user), '/seller/dashboard')
    })
  })

  describe('Portal Context Fallback Handling', () => {
    it('uses fallbackSellerType when user has no explicit sellerProfile or sellerType (Organization)', () => {
      const user = {
        role: USER_ROLES.SELLER,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
      }
      assert.strictEqual(
        destinationFor(user, SELLER_TYPES.RECOGNIZED_ORGANIZATION),
        '/seller/org/dashboard'
      )
    })

    it('uses fallbackSellerType when user has no explicit sellerProfile or sellerType (Enterprise)', () => {
      const user = {
        role: USER_ROLES.SELLER,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
      }
      assert.strictEqual(
        destinationFor(user, SELLER_TYPES.STUDENT_ENTERPRISE),
        '/seller/dashboard'
      )
    })

    it('uses fallbackSellerType when user has no explicit sellerProfile or sellerType (Independent)', () => {
      const user = {
        role: USER_ROLES.SELLER,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
      }
      assert.strictEqual(
        destinationFor(user, SELLER_TYPES.INDEPENDENT_SELLER),
        '/seller/dashboard'
      )
    })

    it('prioritizes user.sellerProfile.sellerType over fallbackSellerType', () => {
      const user = {
        role: USER_ROLES.SELLER,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        sellerProfile: {
          sellerType: SELLER_TYPES.RECOGNIZED_ORGANIZATION,
        },
      }
      // Even if portal badge is STUDENT_ENTERPRISE, user profile is RECOGNIZED_ORGANIZATION
      assert.strictEqual(
        destinationFor(user, SELLER_TYPES.STUDENT_ENTERPRISE),
        '/seller/org/dashboard'
      )
    })
  })

  describe('Unverified / Pending / Rejected Seller Handling', () => {
    it('redirects PENDING verification status seller to /account', () => {
      const user = {
        role: USER_ROLES.SELLER,
        verificationStatus: VERIFICATION_STATUS.PENDING,
        sellerProfile: {
          sellerType: SELLER_TYPES.RECOGNIZED_ORGANIZATION,
        },
      }
      assert.strictEqual(destinationFor(user), '/account')
    })

    it('redirects REJECTED verification status seller to /account', () => {
      const user = {
        role: USER_ROLES.SELLER,
        verificationStatus: VERIFICATION_STATUS.REJECTED,
        sellerProfile: {
          sellerType: SELLER_TYPES.RECOGNIZED_ORGANIZATION,
        },
      }
      assert.strictEqual(destinationFor(user), '/account')
    })

    it('redirects UNVERIFIED status seller to /account', () => {
      const user = {
        role: USER_ROLES.SELLER,
        verificationStatus: 'UNVERIFIED',
        sellerProfile: {
          sellerType: SELLER_TYPES.STUDENT_ENTERPRISE,
        },
      }
      assert.strictEqual(destinationFor(user), '/account')
    })

    it('redirects seller with isVerified: false to /account', () => {
      const user = {
        role: USER_ROLES.SELLER,
        isVerified: false,
        sellerProfile: {
          sellerType: SELLER_TYPES.INDEPENDENT_SELLER,
        },
      }
      assert.strictEqual(destinationFor(user), '/account')
    })
  })

  describe('Admin Redirection', () => {
    it('redirects verified ADMIN to /admin', () => {
      const user = {
        role: USER_ROLES.ADMIN,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
      }
      assert.strictEqual(destinationFor(user), '/admin')
    })

    it('redirects pending ADMIN to /admin (admin bypasses portal check)', () => {
      const user = {
        role: USER_ROLES.ADMIN,
        verificationStatus: VERIFICATION_STATUS.PENDING,
      }
      assert.strictEqual(destinationFor(user), '/admin')
    })
  })

  describe('Non-seller / Buyer Redirection', () => {
    it('redirects BUYER account to /account', () => {
      const user = {
        role: USER_ROLES.BUYER,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
      }
      assert.strictEqual(destinationFor(user), '/account')
    })

    it('redirects null/undefined user to /account', () => {
      assert.strictEqual(destinationFor(null), '/account')
      assert.strictEqual(destinationFor(undefined), '/account')
    })
  })
})
