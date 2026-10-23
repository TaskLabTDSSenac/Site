import { showMessage } from './api.js';
import { mountProtected, taskId, setBusy } from './protected.js';
import { getTask, createTask, updateTask } from './tasks-service.js';
import { setNotice } from './session.js';
const form = document.getElementById('task-form');
const title = document.getElementById('title');
const description = document.getElementById('description');
const save = document.getElementById('save-task');
const message = document.getElementById('form-message');
let id = null;
let ready = false;
function counts() {
  document.getElementById('title-count').textContent = `${title.value.trim().length}/150 caracteres`;
  document.getElementById('description-count').textContent = `${description.value.length}/500 caracteres`;
  title.setCustomValidity('');
  description.setCustomValidity('');
}
title.addEventListener('input', counts);
description.addEventListener('input', counts);
mountProtected(async () => {
  id = taskId(false);
  document.getElementById('page-title').textContent = id ? 'Editar anotação' : 'Nova anotação';
  if (id) {
    const task = await getTask(id);
    title.value = task.title;
    description.value = task.description ?? '';
  }
  counts();
  ready = true;
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!ready || save.disabled) return;
  if (title.value.trim().length < 3 || title.value.trim().length > 150) title.setCustomValidity('Informe um título entre 3 e 150 caracteres após remover espaços das extremidades.');
  if (description.value.length > 500) description.setCustomValidity('A descrição deve ter no máximo 500 caracteres.');
  if (!form.reportValidity()) return;
  setBusy(save, true, 'Salvar');
  showMessage(message, '');
  const data = { title: title.value.trim(), description: description.value || null };
  try {
    if (id) await updateTask(id, data);
    else await createTask(data);
    setNotice(id ? 'task-updated' : 'task-created');
    window.location.replace('inicio.html');
  } catch (error) {
    if (error.status !== 401) showMessage(message, error.status === 404 ? 'Esta anotação não está mais disponível. Volte para minhas notas.' : error.message);
  } finally { setBusy(save, false, 'Salvar'); }
});
