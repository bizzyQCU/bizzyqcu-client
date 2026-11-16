import { SellerRegistrationForm } from '../components/SellerFormParts.jsx'
import { SELLER_TYPES } from '../../../lib/constants'

/**
 * Seller Type: STUDENT_ENTERPRISE (BSE / OJT Academic Ventures)
 * Submits role: 'SELLER', sellerType: 'STUDENT_ENTERPRISE', memberType: 'STUDENT'
 * along with OJT endorsement document, QCU ID photo, and live camera selfie.
 */
export default function EnterpriseSeller() {
  return (
    <SellerRegistrationForm
      portalKey="entrepreneur"
      sellerType={SELLER_TYPES.STUDENT_ENTERPRISE}
      badge="STUDENT_ENTERPRISE"
      titlePrefix="Register as a"
      titleHighlight="Student Enterprise"
      subtitle="For BS Entrepreneurship OJT & Business Implementation ventures."
      fullNameLabel="Enterprise Lead / Full Name"
      fullNamePlaceholder="e.g. Juan Dela Cruz"
      qcuIdLabel="QCU ID Number"
      emailLabel="QCU Email Address"
      emailPlaceholder="you@qcu.edu.ph"
      endorsementLabel="OJT Endorsement Doc"
      endorsementHint="Signed OJT or Business Implementation endorsement (Max 5MB)"
    />
  )
}
