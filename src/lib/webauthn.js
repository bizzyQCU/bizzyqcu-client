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
 * Turns a DOMException thrown by navigator.credentials.* into a user-facing message.
 * Returns null when the error is not a WebAuthn ceremony error.
 */
export function getWebAuthnErrorMessage(error) {
  switch (error?.name) {
    case 'NotAllowedError':
      return 'The passkey prompt was cancelled or timed out. Please try again.';
    case 'InvalidStateError':
      return 'This device already has a passkey registered for your account.';
    case 'SecurityError':
      return 'Passkeys are blocked on this origin. Make sure you are using the official BizzyQCU address.';
    case 'NotSupportedError':
      return 'This device does not support the required passkey type.';
    case 'AbortError':
      return 'The passkey request was aborted.';
    default:
      return null;
  }
}

/** Best-effort friendly label for the current device, e.g. "Chrome on Windows". */
export function guessDeviceName() {
  if (typeof navigator === 'undefined') return '';
  const ua = navigator.userAgent;
  const browser =
    /Edg\//.test(ua) ? 'Edge'
      : /OPR\//.test(ua) ? 'Opera'
        : /Firefox\//.test(ua) ? 'Firefox'
          : /Chrome\//.test(ua) ? 'Chrome'
            : /Safari\//.test(ua) ? 'Safari'
              : 'Browser';
  const os =
    /Android/.test(ua) ? 'Android'
      : /iPhone|iPad|iPod/.test(ua) ? 'iOS'
        : /Windows/.test(ua) ? 'Windows'
          : /Mac OS X/.test(ua) ? 'macOS'
            : /Linux/.test(ua) ? 'Linux'
              : 'this device';
  return `${browser} on ${os}`;
}

/**
 * Executes passkey registration in browser.
 * `options` is the PublicKeyCredentialCreationOptionsJSON returned by
 * POST /auth/webauthn/register/options (@simplewebauthn/server).
 * Returns a RegistrationResponseJSON for POST /auth/webauthn/register/verify.
 */
export async function startPasskeyRegistration(options) {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn / Passkeys are not supported on this browser or device.');
  }

  const publicKey = {
    ...options,
    challenge: base64URLToBuffer(options.challenge),
    user: {
      ...options.user,
      id: base64URLToBuffer(options.user.id),
    },
    excludeCredentials: options.excludeCredentials?.map((cred) => ({
      ...cred,
      id: base64URLToBuffer(cred.id),
    })),
  };

  const credential = await navigator.credentials.create({ publicKey });

  if (!credential) {
    throw new Error('Passkey registration cancelled or failed.');
  }

  const { response } = credential;
  const transports = typeof response.getTransports === 'function' ? response.getTransports() : [];

  return {
    id: credential.id,
    rawId: bufferToBase64URL(credential.rawId),
    type: credential.type,
    authenticatorAttachment: credential.authenticatorAttachment ?? undefined,
    response: {
      clientDataJSON: bufferToBase64URL(response.clientDataJSON),
      attestationObject: bufferToBase64URL(response.attestationObject),
      transports,
    },
    clientExtensionResults: credential.getClientExtensionResults(),
  };
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

