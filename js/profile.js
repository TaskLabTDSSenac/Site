import { request, showMessage, setupPasswordToggles } from './api.js';
import { mountProtected, showUser, setBusy } from './protected.js';

// /openapi.json confirmou somente GET /users/me. Ativar apenas após confirmar
// o contrato de atualização de nome/e-mail no backend.
const PROFILE_UPDATE_AVAILABLE = false;
export async function updateProfile(data) {
  if (!PROFILE_UPDATE_AVAILABLE) throw new Error('A edição de nome e e-mail ainda depende de uma rota na API.');
  return request('/users/me', { method: 'PATCH', authenticated: true, data });
}
const personal = document.getElementById('profile-form');
const passwords = document.getElementById('password-form');
const saveProfile = document.getElementById('save-profile');
const savePassword = document.getElementById('save-password');
const passwordMessage = document.getElementById('password-message');
const profileMessage = document.getElementById('profile-message');
const name = document.getElementById('name');
const email = document.getElementById('email');
const current = document.getElementById('current_password');
const next = document.getElementById('new_password');
const confirm = document.getElementById('confirm_password');
setupPasswordToggles();
function fillUser(user) {
  document.getElementById('user-id').value = user.id;
  name.value = user.name;
  email.value = user.email;
  showUser(user);
}
name.addEventListener('input', () => name.setCustomValidity(''));
for (const input of [next, confirm]) input.addEventListener('input', () => confirm.setCustomValidity(''));
mountProtected(async user => {
  fillUser(user);
  saveProfile.disabled = !PROFILE_UPDATE_AVAILABLE;
  document.getElementById('profile-pending').hidden = PROFILE_UPDATE_AVAILABLE;
});
personal.addEventListener('submit', async event => {
  event.preventDefault();
  if (saveProfile.disabled || !PROFILE_UPDATE_AVAILABLE) return;
  if (name.value.trim().length < 1 || name.value.trim().length > 150) name.setCustomValidity('Informe um nome entre 1 e 150 caracteres.');
  if (!personal.reportValidity()) return;
  setBusy(saveProfile, true, 'Salvar dados');
  showMessage(profileMessage, '');
  try {
    fillUser(await updateProfile({ name: name.value.trim(), email: email.value.trim() }));
    showMessage(profileMessage, 'Dados atualizados com sucesso.', 'success');
  } catch (error) { if (error.status !== 401) showMessage(profileMessage, error.message); }
  finally { setBusy(saveProfile, false, 'Salvar dados'); }
});
passwords.addEventListener('submit', async event => {
  event.preventDefault();
  if (savePassword.disabled) return;
  if (!passwords.reportValidity()) return;
  setBusy(savePassword, true, 'Alterar senha', 'Alterando…');
  showMessage(passwordMessage, '');
  try {
    const response = await request('/users/me/password', { method: 'PATCH', authenticated: true, data: {
      current_password: current.value, new_password: next.value
    } });
    passwords.reset();
    passwords.querySelectorAll('input').forEach(input => { input.type = 'password'; });
    passwords.querySelectorAll('[data-toggle-password]').forEach(button => {
      button.textContent = 'Mostrar'; button.setAttribute('aria-pressed', 'false');
    });
    showMessage(passwordMessage, typeof response?.detail === 'string' ? response.detail : 'Senha alterada com sucesso.', 'success');
  } catch (error) { if (error.status !== 401) showMessage(passwordMessage, error.message); }
  finally { setBusy(savePassword, false, 'Alterar senha'); }
});
