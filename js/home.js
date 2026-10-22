import { request, showMessage } from './api.js';
import { getToken, logout, expireSession } from './session.js';
const content = document.getElementById('account');
const loading = document.getElementById('loading');
const message = document.getElementById('message');
const retry = document.getElementById('retry');
let validating = false;
document.getElementById('logout').addEventListener('click', logout);
retry.addEventListener('click', validateSession);
async function validateSession() {
  if (validating) return;
  content.hidden = true;
  if (!getToken()) { window.location.replace('index.html'); return; }
  validating = true;
  loading.hidden = false;
  retry.hidden = true;
  showMessage(message, '');
  try {
    const user = await request('/users/me', { authenticated: true });
    if (typeof user?.name !== 'string' || typeof user?.email !== 'string') throw new Error('Não foi possível ler seu perfil. Tente novamente.');
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('avatar').textContent = user.name.trim().slice(0, 1).toUpperCase();
    content.hidden = false;
  } catch (error) {
    if (error.status === 401) { expireSession(); return; }
    showMessage(message, error.message);
    retry.hidden = false;
  } finally { validating = false; loading.hidden = true; }
}
// Não restaura dados protegidos do cache de navegação sem revalidar.
window.addEventListener('pagehide', () => { content.hidden = true; });
window.addEventListener('pageshow', event => { if (event.persisted) validateSession(); });
validateSession();
