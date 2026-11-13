import { uploadVerificationDocument } from './api';
import { getErrorMessage } from '../../lib/api-client';

// ============================================================================
// Verification document uploads (QCU_ID, LIVE_SELFIE, SELLER_ENDORSEMENT)
//
// Primary path: POST /api/v1/auth/uploads/verification on bizzyqcu-server
//   - QCU_ID & LIVE_SELFIE: image/jpeg, image/png (max 5MB)
//   - SELLER_ENDORSEMENT:   image/jpeg, image/png, application/pdf (max 5MB)
//
// Fallback in local development when the server has no Cloudinary credentials
// configured (503) or when running against an older server build (404): returns
// a deterministic HTTPS URL so the registration flow can still be tested.
// ============================================================================

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
export const ACCEPTED_DOCUMENT_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export const isImageUploadConfigured = true;

/** Validates a QCU ID or selfie image (JPG or PNG, max 5MB). */
export function validateImageFile(file) {
  if (!file) return 'Please choose an image.';
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'Only JPG or PNG images are allowed.';
  }
  if (file.size > MAX_IMAGE_BYTES) return 'File must not exceed 5MB.';
  return null;
}

/** Validates a seller endorsement document (JPG, PNG, or PDF, max 5MB). */
export function validateDocumentFile(file) {
  if (!file) return 'Please choose a document.';
  if (!ACCEPTED_DOCUMENT_TYPES.includes(file.type)) {
    return 'Only JPG, PNG, or PDF files are allowed.';
  }
  if (file.size > MAX_IMAGE_BYTES) return 'File must not exceed 5MB.';
  return null;
}

const TAG_TO_DOC_TYPE = {
  'qcu-id': 'QCU_ID',
  selfie: 'LIVE_SELFIE',
  endorsement: 'SELLER_ENDORSEMENT',
  QCU_ID: 'QCU_ID',
  LIVE_SELFIE: 'LIVE_SELFIE',
  SELLER_ENDORSEMENT: 'SELLER_ENDORSEMENT',
};

/**
 * Uploads a verification image or endorsement document via POST /auth/uploads/verification
 * and returns its public HTTPS URL.
 *
 * @param {File|Blob} file
 * @param {{ tag?: string, documentType?: 'QCU_ID'|'LIVE_SELFIE'|'SELLER_ENDORSEMENT', qcuIdNumber?: string }} meta
 * @returns {Promise<string>}
 */
export async function uploadVerificationImage(file, { tag, documentType, qcuIdNumber } = {}) {
  const resolvedType = documentType || TAG_TO_DOC_TYPE[tag] || 'QCU_ID';

  try {
    const res = await uploadVerificationDocument(file, resolvedType);
    if (res?.data?.url) {
      return res.data.url;
    }
  } catch (err) {
    const status = err?.response?.status;
    if (import.meta.env.DEV && (status === 404 || status === 502 || status === 503)) {
      const safeId = encodeURIComponent(qcuIdNumber || 'user');
      const ext = file?.type === 'application/pdf' ? 'pdf' : 'jpg';
      console.warn(
        `[auth/upload] Server upload returned ${status}; using dev placeholder URL for ${resolvedType}.`
      );
      return `https://res.cloudinary.com/bizzyqcu/image/upload/v1/verification/${ resolvedType.toLowerCase() }/${safeId}-${Date.now()}.${ext}`;
    }
    throw new Error(getErrorMessage(err));
  }

  throw new Error('Document upload did not return a valid URL.');
}
