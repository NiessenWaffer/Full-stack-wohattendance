/**
 * Centralized Authentication Module
 * Prevents token issues by providing consistent auth handling
 */

const Auth = {
  _initPromise: null,
  _isReady: false,

  // Get fresh token every time
  getToken() {
    return localStorage.getItem('woh_token') || '';
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  },

  // Save token and user data with IMMEDIATE verification
  saveAuth(token, admin) {
    try {
      if (!token || typeof token !== 'string') {
        console.error('[AUTH] Invalid token provided');
        return false;
      }

      // Save token
      localStorage.setItem('woh_token', token);
      
      // IMMEDIATE verification - force localStorage flush
      const savedToken = localStorage.getItem('woh_token');
      if (savedToken !== token) {
        console.error('[AUTH] Token verification failed - localStorage write incomplete');
        return false;
      }

      // Save admin data
      if (admin) {
        localStorage.setItem('woh_admin', JSON.stringify(admin));
        localStorage.setItem('woh_role', admin.role || 'admin');
        localStorage.setItem('woh_name', admin.display_name || 'Admin');
      }

      console.log('[AUTH] Token saved and verified successfully');
      return true;
    } catch (err) {
      console.error('[AUTH] Failed to save token:', err);
      return false;
    }
  },

  // Clear all auth data
  clearAuth() {
    localStorage.removeItem('woh_token');
    localStorage.removeItem('woh_admin');
    localStorage.removeItem('woh_role');
    localStorage.removeItem('woh_name');
    console.log('[AUTH] Auth data cleared');
  },

  // Get headers for API requests (ALWAYS FRESH TOKEN)
  getHeaders() {
    const token = this.getToken();
    if (!token) {
      console.warn('[AUTH] getHeaders called but no token available');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  },

  // Handle 401 responses
  handle401(response) {
    if (response.status === 401) {
      console.warn('[AUTH] 401 Unauthorized - redirecting to login');
      this.clearAuth();
      window.location.href = '/login.html';
      return true;
    }
    return false;
  },

  // Redirect to login with reason
  redirectToLogin(reason) {
    console.warn(`[AUTH] Redirecting to login: ${reason}`);
    this.clearAuth();
    window.location.href = '/login.html';
  },

  // Require authentication (call at page load)
  requireAuth() {
    if (!this.isAuthenticated()) {
      this.redirectToLogin('NO_TOKEN');
      return false;
    }
    return true;
  },

  // Verify token is valid by making a test API call
  async verifyToken() {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      const response = await fetch('/api/dashboard/summary', {
        headers: this.getHeaders()
      });

      if (response.status === 401) {
        console.warn('[AUTH] Token verification failed - invalid or expired');
        return false;
      }

      if (!response.ok) {
        console.warn('[AUTH] Token verification request failed:', response.status);
        return false;
      }

      console.log('[AUTH] Token verified successfully');
      return true;
    } catch (err) {
      console.error('[AUTH] Token verification error:', err);
      return false;
    }
  },

  // Initialize app with proper auth check
  async initializeApp() {
    // Prevent multiple simultaneous initializations
    if (this._initPromise) {
      return this._initPromise;
    }

    this._initPromise = (async () => {
      console.log('[AUTH] Initializing app...');

      // Step 1: Check token exists
      if (!this.isAuthenticated()) {
        this.redirectToLogin('NO_TOKEN');
        throw new Error('NO_TOKEN');
      }

      // Step 2: Verify token is valid
      const isValid = await this.verifyToken();
      if (!isValid) {
        this.redirectToLogin('INVALID_TOKEN');
        throw new Error('INVALID_TOKEN');
      }

      this._isReady = true;
      console.log('[AUTH] App initialized successfully');
      return true;
    })();

    return this._initPromise;
  },

  // Check if app is ready
  isReady() {
    return this._isReady;
  },

  // Logout
  logout() {
    // Send logout request to server
    if (this.isAuthenticated()) {
      navigator.sendBeacon('/api/sessions/logout',
        JSON.stringify({ token: this.getToken() })
      );
    }
    this.clearAuth();
    window.location.href = '/login.html';
  }
};

// Make it globally available
window.Auth = Auth;

console.log('[AUTH] Auth module loaded');
