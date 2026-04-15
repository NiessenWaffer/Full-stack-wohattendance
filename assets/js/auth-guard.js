/**
 * Global Authentication Guard
 * 
 * A reusable inline authentication guard script that can be embedded in HTML pages
 * to enforce authentication before page rendering.
 * 
 * This guard executes synchronously before any other scripts and blocks page
 * rendering on authentication failure.
 * 
 * Features:
 * 1. Synchronous token existence check using localStorage
 * 2. Async token verification with 5000ms timeout wrapper
 * 3. URL preservation logic (store/retrieve from localStorage)
 * 4. Error handling with proper reason codes
 * 5. Comprehensive console logging for debugging
 * 
 * Integration:
 * - Uses existing Auth module methods (single source of truth)
 * - Stores redirect URL in localStorage under 'woh_redirect_url'
 * - Redirects to login page with appropriate reason codes
 */

const AuthGuard = {
  // Error reasons matching Auth module
  FAILURE_REASONS: {
    NO_TOKEN: 'NO_TOKEN',
    INVALID_TOKEN: 'INVALID_TOKEN',
    VERIFICATION_FAILED: 'VERIFICATION_FAILED',
    TIMEOUT: 'TIMEOUT'
  },

  // Check if current page is login page
  isLoginPage() {
    return window.location.pathname === '/login.html';
  },

  // Get token from localStorage (synchronous)
  getToken() {
    return localStorage.getItem('woh_token') || '';
  },

  // Check if token exists (synchronous)
  hasToken() {
    return !!this.getToken();
  },

  // Verify token with timeout wrapper
  async verifyTokenWithTimeout(timeoutMs = 5000) {
    try {
      if (!window.Auth || !window.Auth.verifyToken) {
        throw new Error('Auth module not available');
      }

      return await Promise.race([
        window.Auth.verifyToken(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)
        )
      ]);
    } catch (error) {
      console.error('[AUTH-GUARD] Token verification error:', error.message);
      return false;
    }
  },

  // Store redirect URL
  storeRedirectUrl() {
    localStorage.setItem('woh_redirect_url', window.location.href);
  },

  // Clear redirect URL
  clearRedirectUrl() {
    localStorage.removeItem('woh_redirect_url');
  },

  // Main guard execution
  async execute() {
    console.log('[AUTH-GUARD] Starting authentication check...');

    // 1. Check if login page
    if (this.isLoginPage()) {
      console.log('[AUTH-GUARD] Login page detected, skipping guard');
      return { allowed: true };
    }

    // 2. Check token existence (fast path)
    if (!this.hasToken()) {
      console.warn('[AUTH-GUARD] No token found, redirecting to login');
      this.storeRedirectUrl();
      window.Auth?.redirectToLogin?.(this.FAILURE_REASONS.NO_TOKEN) || 
        (window.location.href = '/login.html');
      return { allowed: false, reason: this.FAILURE_REASONS.NO_TOKEN };
    }

    // 3. Verify token validity (async with timeout)
    try {
      const isValid = await this.verifyTokenWithTimeout();
      if (!isValid) {
        console.warn('[AUTH-GUARD] Token validation failed, redirecting to login');
        window.Auth?.clearAuth?.();
        this.storeRedirectUrl();
        window.Auth?.redirectToLogin?.(this.FAILURE_REASONS.INVALID_TOKEN) ||
          (window.location.href = '/login.html');
        return { allowed: false, reason: this.FAILURE_REASONS.INVALID_TOKEN };
      }
    } catch (error) {
      console.error('[AUTH-GUARD] Token verification failed:', error.message);
      this.storeRedirectUrl();
      const reason = error.message === 'TIMEOUT' 
        ? this.FAILURE_REASONS.TIMEOUT 
        : this.FAILURE_REASONS.VERIFICATION_FAILED;
      window.Auth?.redirectToLogin?.(reason) ||
        (window.location.href = '/login.html');
      return { allowed: false, reason };
    }

    console.log('[AUTH-GUARD] Authentication check passed');
    return { allowed: true };
  }
};

// Make available globally
window.AuthGuard = AuthGuard;

console.log('[AUTH-GUARD] Auth guard module loaded');