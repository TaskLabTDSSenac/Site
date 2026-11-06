import { request, showMessage, setupPasswordToggles } from './api.js';
import { clearToken, setNotice } from './session.js';
const form = document.querySelector('form');
const button = form.querySelector('[type=submit]');
const message = document.getElementById('message');
setupPasswordToggles();
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (button.disabled || !form.reportValidity()) return;
  const name = form.elements.namedItem('name').value.trim();
  const password = form.password.value;
  if (name.length < 1 || name.length > 150) {
    showMessage(message, 'Informe um nome entre 1 e 150 caracteres, sem contar os espaços nas extremidades.');
    form.elements.namedItem('name').focus();
    return;
  }
  if (password.length < 6 || password.length > 128) {
    showMessage(message, 'A senha deve ter entre 8 e 128 caracteres.');
    form.password.focus();
    return;
  }
  button.disabled = true;
  button.textContent = 'Criando conta…';
  showMessage(message, '');
  try {
    await request('/auth/register', { method: 'POST', data: {
      name, email: form.email.value.trim(), password
    } });
    clearToken();
    setNotice('registered');
    form.reset();
    window.location.replace('index.html');
  } catch (error) { showMessage(message, error.message); }
  finally { button.disabled = false; button.textContent = 'Criar conta'; }
});
