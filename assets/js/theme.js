/**
 * Theme Manager - Dark Mode Toggle
 * Handles theme switching and persistence
 */

const ThemeManager = {
  STORAGE_KEY: 'woh_theme',
  mediaQuery: null,
  
  init() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.loadTheme();
    this.attachMediaQueryListener();
  },
  
  loadTheme() {
    const savedTheme = localStorage.getItem(this.STORAGE_KEY) || 'auto';
    this.applyTheme(savedTheme);
  },
  
  applyTheme(theme) {
    if (theme === 'auto') {
      const prefersDark = this.mediaQuery ? this.mediaQuery.matches : false;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  },
  
  setTheme(theme) {
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.applyTheme(theme);
  },
  
  attachMediaQueryListener() {
    if (!this.mediaQuery) return;
    
    this.mediaQuery.addEventListener('change', (e) => {
      const savedTheme = localStorage.getItem(this.STORAGE_KEY) || 'auto';
      if (savedTheme === 'auto') {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
  }
};

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
} else {
  ThemeManager.init();
}
