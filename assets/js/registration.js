window.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const firstNameInput = document.getElementById('first_name');
  const lastNameInput = document.getElementById('last_name');
  const ministrySelect = document.getElementById('ministry');
  const submitButton = document.querySelector('.btn-submit');
  const errorMessage = document.querySelector('.error-message');
  const apiUrl = '/api/register';
  const NAME_REGEX = /^[\p{L}][\p{L}\s'-]*$/u;
  let errorTimeout = null;
  firstNameInput.focus();
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const first_name = firstNameInput.value.trim();
    const last_name = lastNameInput.value.trim();
    const ministry = ministrySelect.value.trim();
    if (!first_name || !last_name || !ministry) {
      showError('All fields are required');
      return;
    }
    if (!NAME_REGEX.test(first_name) || !NAME_REGEX.test(last_name)) {
      showError('All fields are required');
      return;
    }
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Registering...';
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name,
          last_name,
          ministry
        })
      });
      let data = {};
      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          showError('Registration failed');
          submitButton.disabled = false;
          submitButton.textContent = originalText;
          return;
        }
      }
      if (data.status === 'success' && response.status === 200) {
        sessionStorage.setItem('registeredMember', JSON.stringify(data.member));
        window.location.href = 'qr-generate.html';
        return;
      }
      if (response.status === 429) {
        showError(
          data.message || 'Too many registration attempts, please try again later'
        );
      } else {
        showError(data.message || 'Registration failed');
      }
    } catch {
      showError('Registration failed');
    }
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  });
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.opacity = '1';
    if (errorTimeout) {
      clearTimeout(errorTimeout);
    }
    errorTimeout = setTimeout(() => {
      errorMessage.style.opacity = '0';
    }, 5000);
  }
});
