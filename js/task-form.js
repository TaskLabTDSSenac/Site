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
  document.getElementById('page-title').textContent = id ? 'Editar uma missão' : 'Uma nova missão';
  if (id) {
    title.removeAttribute('maxlength');
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
  const trimmed = title.value.trim();
  const whitespaceCreation = !id && title.value.length > 0 && trimmed.length === 0 && title.value.length <= 150;
  title.setCustomValidity('');
  if (!whitespaceCreation && (trimmed.length < 3 || (!id && trimmed.length > 150))) title.setCustomValidity('Informe um título entre 3 e 150 caracteres após remover espaços das extremidades.');
  if (description.value.length > 500) description.setCustomValidity('A descrição deve ter no máximo 500 caracteres.');
  if (!form.reportValidity()) return;
  setBusy(save, true, 'Salvar');
  showMessage(message, '');
  const data = { title: title.value, description: description.value || null };
  try {
    if (id) await updateTask(id, data);
    else await createTask(data);
    setNotice(id ? 'task-updated' : 'task-created');
    window.location.replace('inicio.html');
  } catch (error) {
    if (error.status !== 401) showMessage(message, error.status === 404 ? 'Esta tarefa não está mais disponível. Volte para Minhas tarefas.' : error.message);
  } finally { setBusy(save, false, 'Salvar'); }
});
