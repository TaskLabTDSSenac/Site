import { request, showMessage, setupPasswordToggles } from './api.js';
import { getToken, setToken, clearToken, takeNotice } from './session.js';
const form = document.querySelector('form');
const button = form.querySelector('[type=submit]');
const message = document.getElementById('message');
setupPasswordToggles();
const notice = takeNotice();
if (notice === 'registered') showMessage(message, 'Conta criada com sucesso. Faça login para continuar.', 'success');
if (notice === 'expired') showMessage(message, 'Sua sessão expirou. Faça login novamente.');
async function checkSession() {
  if (!getToken()) return;
  button.disabled = true;
  button.textContent = 'Verificando sessão…';
  try {
    await request('/users/me', { authenticated: true });
    window.location.replace('inicio.html');
  } catch (error) {
    if (error.status === 401) {
      clearToken();
      showMessage(message, 'Sua sessão expirou. Faça login novamente.');
    } else showMessage(message, error.message);
  } finally { button.disabled = false; button.textContent = 'Entrar'; }
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (button.disabled || !form.reportValidity()) return;
  button.disabled = true;
  button.textContent = 'Entrando…';
  showMessage(message, '');
  try {
    const result = await request('/auth/login', {
      method: 'POST', data: { email: form.email.value.trim(), password: form.password.value }
    });
    if (typeof result?.access_token !== 'string' || !result.access_token || result.token_type !== 'bearer') {
      throw new Error('A API não retornou uma sessão válida. Tente novamente.');
    }
    setToken(result.access_token);
    form.password.value = '';
    window.location.replace('inicio.html');
  } catch (error) { showMessage(message, error.message); }
  finally { button.disabled = false; button.textContent = 'Entrar'; }
});
checkSession();
