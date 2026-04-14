/**
 * HTML Sanitization - Prevent XSS attacks
 */

const Sanitize = {
  /**
   * Escape HTML special characters
   */
  html(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Escape for use in HTML attributes
   */
  attr(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  /**
   * Safe innerHTML - escapes all user data
   */
  safeHTML(template, data) {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
      const escaped = this.html(value);
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), escaped);
    }
    return result;
  }
};

window.Sanitize = Sanitize;
console.log('[SANITIZE] Sanitization module loaded');
