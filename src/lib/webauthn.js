/**
 * Native Browser WebAuthn Passkey Utilities
 * Handles Base64URL <-> ArrayBuffer conversions without external dependencies.
 */

export function bufferToBase64URL(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function base64URLToBuffer(base64URL) {
  const base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function isWebAuthnSupported() {
  return typeof window !== 'undefined' &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === 'function';
}

/**
 * Executes passkey authentication in browser
 */
export async function startPasskeyLogin(options) {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn / Passkeys are not supported on this browser or device.');
  }

  const publicKey = {
    ...options,
    challenge: base64URLToBuffer(options.challenge),
    allowCredentials: options.allowCredentials?.map((cred) => ({
      ...cred,
      id: base64URLToBuffer(cred.id),
    })),
  };

  const credential = await navigator.credentials.get({ publicKey });

  if (!credential) {
    throw new Error('Authentication cancelled or failed.');
  }

  return {
    id: credential.id,
    rawId: bufferToBase64URL(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64URL(credential.response.clientDataJSON),
      authenticatorData: bufferToBase64URL(credential.response.authenticatorData),
      signature: bufferToBase64URL(credential.response.signature),
      userHandle: credential.response.userHandle
        ? bufferToBase64URL(credential.response.userHandle)
        : null,
    },
    clientExtensionResults: credential.getClientExtensionResults(),
  };
}

