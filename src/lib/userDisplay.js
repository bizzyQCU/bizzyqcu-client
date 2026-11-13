/**
 * Shared formatting helpers for displaying authenticated user identity.
 */

export function getInitials(name, fallback = '?') {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return fallback;
  return parts
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function formatAuthorShort(fullName, fallback = 'QCU Buyer') {
  const parts = String(fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

const VERIFICATION_LABELS = {
  VERIFIED: 'Verified QCU',
  PENDING: 'Pending verification',
  REJECTED: 'Verification rejected',
};

export function getVerificationLabel(status) {
  return VERIFICATION_LABELS[status] || 'Unverified';
}
