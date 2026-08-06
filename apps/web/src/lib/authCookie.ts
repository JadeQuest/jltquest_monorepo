/**
 * Auth & Cookie Security Management Utility
 * Provides secure client-side and server-side cookie handling, XSS sanitization,
 * CSRF token validation, session expiration checks, and GDPR/CCPA consent tracking.
 */

export interface CookieOptions {
  days?: number;
  sameSite?: 'Lax' | 'Strict' | 'None';
  secure?: boolean;
  path?: string;
}

export interface UserSession {
  token: string;
  expiresAt: number;
  userAddress?: string;
}

const DEFAULT_OPTIONS: CookieOptions = {
  days: 7,
  sameSite: 'Lax',
  secure: typeof window !== 'undefined' ? window.location.protocol === 'https:' : true,
  path: '/',
};

function safeGetLocalStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetLocalStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Browsers can block storage in private or restricted contexts.
  }
}

/**
 * Set a secure cookie with proper attributes (SameSite, Secure, Expiry)
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof document === 'undefined') return;

  const config = { ...DEFAULT_OPTIONS, ...options };
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (config.days) {
    const date = new Date();
    date.setTime(date.getTime() + config.days * 24 * 60 * 60 * 1000);
    cookieString += `; expires=${date.toUTCString()}`;
  }

  cookieString += `; path=${config.path || '/'}`;
  cookieString += `; SameSite=${config.sameSite || 'Lax'}`;

  if (config.secure) {
    cookieString += '; Secure';
  }

  document.cookie = cookieString;
}

/**
 * Read a cookie by name safely
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const nameEQ = encodeURIComponent(name) + '=';
  const ca = document.cookie.split(';');

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
}

/**
 * Delete a cookie cleanly upon logout or session termination
 */
export function deleteCookie(name: string, path: string = '/'): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; SameSite=Lax; Secure`;
}

/**
 * XSS Input Sanitizer — Strips malicious HTML/script tags from user input strings
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Anti-CSRF Token Generation & Validation
 */
export function generateCsrfToken(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).substring(2, 15);
}

export function setCsrfToken(): string {
  const token = generateCsrfToken();
  setCookie('jlt_csrf', token, { days: 1, sameSite: 'Strict' });
  return token;
}

export function validateCsrfToken(token: string): boolean {
  const stored = getCookie('jlt_csrf');
  return !!stored && stored === token;
}

/**
 * GDPR / CCPA Cookie Consent Management with IP Persistence
 */
export function getCookieConsent(): boolean {
  return getCookie('jlt_cookie_consent') === 'accepted';
}

export function setCookieConsent(accepted: boolean): void {
  setCookie('jlt_cookie_consent', accepted ? 'accepted' : 'declined', { days: 365 });
  if (typeof window !== 'undefined') {
    safeSetLocalStorage('jlt_cookie_consent', accepted ? 'accepted' : 'declined');
  }
}

export function hasConsentBeenGiven(): boolean {
  if (typeof window === 'undefined') return false;

  // Check direct cookie
  const consentCookie = getCookie('jlt_cookie_consent');
  if (consentCookie === 'accepted' || consentCookie === 'declined') return true;

  // Check localStorage
  const localConsent = safeGetLocalStorage('jlt_cookie_consent');
  if (localConsent === 'accepted' || localConsent === 'declined') return true;

  // Check stored IP consent record
  const savedIp = safeGetLocalStorage('jlt_user_ip');
  if (savedIp) {
    const ipConsent = safeGetLocalStorage(`jlt_cookie_consent_${savedIp}`);
    if (ipConsent === 'accepted' || ipConsent === 'declined') return true;
  }

  return false;
}

export function saveConsentForIp(accepted: boolean, ip?: string): void {
  const status = accepted ? 'accepted' : 'declined';
  setCookie('jlt_cookie_consent', status, { days: 365 });
  
  if (typeof window !== 'undefined') {
    safeSetLocalStorage('jlt_cookie_consent', status);
    if (ip) {
      safeSetLocalStorage('jlt_user_ip', ip);
      safeSetLocalStorage(`jlt_cookie_consent_${ip}`, status);
      setCookie(`jlt_cookie_consent_${ip}`, status, { days: 365 });
    }
  }
}

/**
 * Session Expiration & Refresh Rotation Utility
 */
export function isSessionValid(): boolean {
  const sessionData = getCookie('jlt_session');
  if (!sessionData) return false;

  try {
    const session: UserSession = JSON.parse(sessionData);
    return session.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export function clearUserSession(): void {
  deleteCookie('jlt_session');
  deleteCookie('jlt_auth_token');
  deleteCookie('jlt_csrf');
}
