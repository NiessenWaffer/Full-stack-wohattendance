document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const submitButton = document.querySelector('.btn-submit');
  const originalButtonText = submitButton.textContent;
  const passwordInput = document.getElementById('password');
  let failedLoginAttempts = 0;
  const LOCKOUT_MS = 15 * 60 * 1000;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = passwordInput.value;
    submitButton.disabled = true;
    submitButton.textContent = 'Signing In...';
    let data = {};
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
          showError('An error occurred. Please try again.');
          return;
        }
      }
      if (data.status === 'success' && response.status === 200) {
        failedLoginAttempts = 0;
        
        // Save token with IMMEDIATE verification (no setTimeout)
        const saved = Auth.saveAuth(data.token, data.admin);
        
        if (!saved) {
          showError('Failed to save authentication. Please try again.');
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
          return;
        }
        
        // Double-check token is actually saved
        if (!Auth.isAuthenticated()) {
          showError('Authentication verification failed. Please try again.');
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
          return;
        }
        
        console.log('[LOGIN] Token saved and verified - redirecting to dashboard');
        
        // Set post-login flag for dashboard loading duration
        sessionStorage.setItem('woh_post_login', 'true');
        
        // Redirect immediately - no delay needed
        window.location.href = '/dashboard/dashboard.html';
        return;
      }
      passwordInput.value = '';
      if (response.status === 429) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        showError(
          data.message || 'Too many login attempts, please try again later'
        );
        return;
      }
      if (response.status >= 500) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        showError('An error occurred. Please try again.');
        return;
      }
      failedLoginAttempts += 1;
      if (failedLoginAttempts >= 5) {
        submitButton.disabled = true;
        submitButton.textContent = originalButtonText;
        showError('Too many attempts. Please wait before trying again.');
        setTimeout(() => {
          failedLoginAttempts = 0;
          submitButton.disabled = false;
        }, LOCKOUT_MS);
        return;
      }
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
      showError(data.message || 'Invalid email or password');
    } catch {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
      showError('An error occurred. Please try again.');
    }
  });
});
function showError(message) {
  let errorDiv = document.querySelector('.error-message');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText =
      'color: #dc2626; margin-top: 12px; font-size: 14px; text-align: center;';
    const formEl = document.querySelector('form');
    formEl.appendChild(errorDiv);
  }
  errorDiv.textContent = message;
  errorDiv.style.opacity = '1';
  errorDiv.style.transition = 'opacity 0.2s ease';
  if (errorDiv.autoFadeTimeout) {
    clearTimeout(errorDiv.autoFadeTimeout);
  }
  errorDiv.autoFadeTimeout = setTimeout(() => {
    errorDiv.style.opacity = '0';
    setTimeout(() => {
      errorDiv.remove();
    }, 200);
  }, 5000);
}
