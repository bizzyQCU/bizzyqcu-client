import { SellerRegistrationForm } from '../components/SellerFormParts.jsx'
import { SELLER_TYPES } from '../../../lib/constants'

/**
 * Seller Type: RECOGNIZED_ORGANIZATION (Accredited QCU Student Organizations)
 * Submits role: 'SELLER', sellerType: 'RECOGNIZED_ORGANIZATION', memberType: 'STUDENT'
 * along with OSA Recognition Certificate, Officer QCU ID photo, and live camera selfie.
 */
export default function OrganizationSeller() {
  return (
    <SellerRegistrationForm
      portalKey="organization"
      sellerType={SELLER_TYPES.RECOGNIZED_ORGANIZATION}
      badge="RECOGNIZED_ORGANIZATION"
      titlePrefix="Register a"
      titleHighlight="Student Organization"
      titleSuffix="Seller Account"
      subtitle="For OSA-recognized QCU student organizations, clubs, and councils."
      fullNameLabel="Authorized Officer Full Name"
      fullNamePlaceholder="e.g. Juan Dela Cruz"
      qcuIdLabel="Officer QCU ID"
      emailLabel="Official Organization Email"
      emailPlaceholder="org@qcu.edu.ph"
      endorsementLabel="OSA Recognition Cert"
      endorsementHint="Valid Office of Student Affairs recognition certificate (Max 5MB)"
    />
  )
}
