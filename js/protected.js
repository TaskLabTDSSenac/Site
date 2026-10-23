import { request, showMessage } from './api.js';
import { getToken, logout } from './session.js';

export function showUser(user) {
  document.getElementById('header-user').textContent = user.name;
}

export function mountProtected(load) {
  const content = document.getElementById('content');
  const loading = document.getElementById('loading');
  const message = document.getElementById('message');
  const retry = document.getElementById('retry');
  let busy = false;
  document.getElementById('logout').addEventListener('click', logout);
  async function start() {
    if (busy) return;
    content.hidden = true;
    if (!getToken()) { window.location.replace('index.html'); return; }
    busy = true;
    loading.hidden = false;
    retry.hidden = true;
    showMessage(message, '');
    try {
      const user = await request('/users/me', { authenticated: true });
      showUser(user);
      await load(user);
      content.hidden = false;
    } catch (error) {
      if (error.status !== 401) {
        showMessage(message, error.status === 404 ? 'Esta anotação não está disponível. Volte para minhas notas.' : error.message);
        retry.hidden = error.status === 404;
      }
    } finally { loading.hidden = true; busy = false; }
  }
  retry.addEventListener('click', start);
  window.addEventListener('pagehide', () => { content.hidden = true; });
  window.addEventListener('pageshow', event => { if (event.persisted) start(); });
  start();
}

export function taskId(required = true) {
  const parameters = new URLSearchParams(window.location.search);
  if (!parameters.has('id') && !required) return null;
  const id = parameters.get('id');
  if (!id || !/^[1-9]\d*$/.test(id) || id.length > 19 || BigInt(id) > 9223372036854775807n) {
    throw new Error('Identificador de anotação inválido. Volte para minhas notas.');
  }
  return id;
}

export function setBusy(button, busy, label, progress = 'Salvando…') {
  button.disabled = busy;
  button.textContent = busy ? progress : label;
}
