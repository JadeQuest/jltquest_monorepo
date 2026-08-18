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

export const AUTH_COOKIE_NAME = 'jlt_auth_token';
export const REFRESH_COOKIE_NAME = 'jlt_refresh_token';
export const CSRF_COOKIE_NAME = 'jlt_csrf';
export const SESSION_COOKIE_NAME = 'jlt_session';
export const CONSENT_COOKIE_NAME = 'jlt_cookie_consent';

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

function safeRemoveLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore errors
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
 * Supports path string or options object, and reliably purges across HTTP and HTTPS environments.
 */
export function deleteCookie(name: string, pathOrOptions: string | CookieOptions = '/'): void {
  if (typeof document === 'undefined') return;

  const path = typeof pathOrOptions === 'string' ? pathOrOptions : pathOrOptions.path || '/';
  const isSecure = typeof pathOrOptions === 'object' && pathOrOptions.secure !== undefined
    ? pathOrOptions.secure
    : (typeof window !== 'undefined' ? window.location.protocol === 'https:' : false);

  // Expire with SameSite=Lax
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; SameSite=Lax${isSecure ? '; Secure' : ''}`;
  
  // Also expire without Secure flag to handle cookies set in mixed or localhost environments
  if (isSecure) {
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; SameSite=Lax`;
  }
}

/**
 * Direct typed helpers for Auth & Refresh tokens
 */
export function getAuthToken(): string | null {
  return getCookie(AUTH_COOKIE_NAME);
}

export function setAuthToken(token: string, days: number = 7): void {
  setCookie(AUTH_COOKIE_NAME, token, { days });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth-state-change', { detail: { isAuthenticated: true } }));
  }
}

export function getRefreshToken(): string | null {
  return getCookie(REFRESH_COOKIE_NAME);
}

export function setRefreshToken(token: string, days: number = 30): void {
  setCookie(REFRESH_COOKIE_NAME, token, { days });
}

export function hasAuthToken(): boolean {
  return !!getAuthToken();
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
  setCookie(CSRF_COOKIE_NAME, token, { days: 1, sameSite: 'Strict' });
  return token;
}

export function validateCsrfToken(token: string): boolean {
  const stored = getCookie(CSRF_COOKIE_NAME);
  return !!stored && stored === token;
}

/**
 * GDPR / CCPA Cookie Consent Management with IP Persistence
 */
export function getCookieConsent(): boolean {
  return getCookie(CONSENT_COOKIE_NAME) === 'accepted';
}

export function setCookieConsent(accepted: boolean): void {
  setCookie(CONSENT_COOKIE_NAME, accepted ? 'accepted' : 'declined', { days: 365 });
  if (typeof window !== 'undefined') {
    safeSetLocalStorage(CONSENT_COOKIE_NAME, accepted ? 'accepted' : 'declined');
  }
}

export function hasConsentBeenGiven(): boolean {
  if (typeof window === 'undefined') return false;

  const consentCookie = getCookie(CONSENT_COOKIE_NAME);
  if (consentCookie === 'accepted' || consentCookie === 'declined') return true;

  const localConsent = safeGetLocalStorage(CONSENT_COOKIE_NAME);
  if (localConsent === 'accepted' || localConsent === 'declined') return true;

  const savedIp = safeGetLocalStorage('jlt_user_ip');
  if (savedIp) {
    const ipConsent = safeGetLocalStorage(`jlt_cookie_consent_${savedIp}`);
    if (ipConsent === 'accepted' || ipConsent === 'declined') return true;
  }

  return false;
}

export function saveConsentForIp(accepted: boolean, ip?: string): void {
  const status = accepted ? 'accepted' : 'declined';
  setCookie(CONSENT_COOKIE_NAME, status, { days: 365 });
  
  if (typeof window !== 'undefined') {
    safeSetLocalStorage(CONSENT_COOKIE_NAME, status);
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
  const sessionData = getCookie(SESSION_COOKIE_NAME);
  if (!sessionData) return false;

  try {
    const session: UserSession = JSON.parse(sessionData);
    return session.expiresAt > Date.now();
  } catch {
    return false;
  }
}

/**
 * Cleanly clear all session and auth cookies/storage
 */
export function clearUserSession(): void {
  deleteCookie(SESSION_COOKIE_NAME);
  deleteCookie(AUTH_COOKIE_NAME);
  deleteCookie(REFRESH_COOKIE_NAME);
  deleteCookie(CSRF_COOKIE_NAME);

  safeRemoveLocalStorage('jlt_session');
  safeRemoveLocalStorage('jlt_auth_token');
  safeRemoveLocalStorage('jlt_refresh_token');

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth-state-change', { detail: { isAuthenticated: false } }));
  }
}
