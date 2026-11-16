import { SellerRegistrationForm } from '../components/SellerFormParts.jsx'
import { SELLER_TYPES } from '../../../lib/constants'

/**
 * Seller Type: INDEPENDENT_SELLER (Enrolled QCU Students selling on their own)
 * Submits role: 'SELLER', sellerType: 'INDEPENDENT_SELLER', memberType: 'STUDENT'
 * along with Proof of Enrollment (COR), QCU ID photo, and live camera selfie.
 */
export default function IndividualSeller() {
  return (
    <SellerRegistrationForm
      portalKey="individual"
      sellerType={SELLER_TYPES.INDEPENDENT_SELLER}
      badge="INDEPENDENT_SELLER"
      titlePrefix="Register as an"
      titleHighlight="Independent Seller"
      subtitle="For enrolled QCU students selling crafts, food, pre-loved items, or peer services."
      fullNameLabel="Student Full Name"
      fullNamePlaceholder="e.g. Juan Dela Cruz"
      qcuIdLabel="QCU ID Number"
      emailLabel="QCU Email Address"
      emailPlaceholder="you@qcu.edu.ph"
      endorsementLabel="Proof of Enrollment (COR)"
      endorsementHint="Current semester Certificate of Registration (Max 5MB)"
    />
  )
}
