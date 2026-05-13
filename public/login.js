const form = document.getElementById('loginForm');
const errBox = document.getElementById('err');
const submit = document.getElementById('submit');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errBox.classList.add('hidden');
  errBox.textContent = '';
  submit.disabled = true;

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      errBox.textContent = data.error || 'Sign in failed';
      errBox.classList.remove('hidden');
      return;
    }
    window.location.href = '/';
  } catch (err) {
    errBox.textContent = 'Network error: ' + err.message;
    errBox.classList.remove('hidden');
  } finally {
    submit.disabled = false;
  }
});
