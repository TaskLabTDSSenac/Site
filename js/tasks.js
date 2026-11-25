import { showMessage } from './api.js';
import { takeNotice } from './session.js';
import { mountProtected } from './protected.js';
import { listTasks } from './tasks-service.js';
import { runTaskAction } from './task-actions.js';

const list = document.getElementById('task-list');
const message = document.getElementById('task-message');
const retry = document.getElementById('tasks-retry');
let loading = false;
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function icon(name) {
  const paths = {
    view: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
    complete: '<path d="m5 12 4 4L19 6"/>',
    delete: '<path d="M3 6h18"/><path d="M8 6V4h8v2m3 0-1 14H6L5 6"/><path d="M10 11v5m4-5v5"/>'
  };
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = paths[name];
  return svg;
}
function iconButton(node, key, label) {
  node.prepend(icon(key));
  node.classList.add('icon-action');
  node.setAttribute('aria-label', label);
}
async function refresh() {
  if (loading) return;
  loading = true;
  document.getElementById('tasks-loading').hidden = false;
  retry.hidden = true;
  try {
    const tasks = await listTasks();
    list.replaceChildren();
    document.getElementById('empty').hidden = tasks.length !== 0;
    for (const task of tasks) {
      const card = element('article', undefined, 'task-card');
      card.append(element('span', task.completed ? 'Concluída' : 'Pendente', `status ${task.completed ? 'done' : 'pending'}`));
      card.append(element('h2', task.title));
      const description = task.description || 'Sem descrição';
      card.append(element('p', description.length > 180 ? description.slice(0, 180) + '…' : description, 'task-summary'));
      const actions = element('div', undefined, 'actions');
      for (const [label, url] of [['Visualizar', 'tarefa-detalhes.html'], ['Editar', 'tarefa.html']]) {
        const link = element('a', label, 'paper-button');
        link.href = `${url}?id=${encodeURIComponent(task.id)}`;
        iconButton(link, label === 'Visualizar' ? 'view' : 'edit', label + ' tarefa');
        actions.append(link);
      }
      for (const [kind, label] of [['complete', 'Concluir'], ['delete', 'Excluir']]) {
        if (kind === 'complete' && task.completed) continue;
        const button = element('button', label, kind === 'delete' ? 'paper-button danger' : 'paper-button');
        button.type = 'button';
        iconButton(button, kind, label + ' tarefa');
        button.addEventListener('click', () => runTaskAction(kind, task, actions, message, refresh, async () => {
          showMessage(message, 'Tarefa excluída com sucesso.', 'success');
          await refresh();
        }));
        actions.append(button);
      }
      card.append(actions);
      list.append(card);
    }
  } catch (error) {
    if (error.status !== 401) { showMessage(message, error.message); retry.hidden = false; }
  } finally { loading = false; document.getElementById('tasks-loading').hidden = true; }
}
retry.addEventListener('click', refresh);
mountProtected(async () => {
  const notices = { 'task-created': 'Tarefa criada com sucesso.', 'task-updated': 'Tarefa atualizada com sucesso.', 'task-deleted': 'Tarefa excluída com sucesso.' };
  const notice = notices[takeNotice()];
  if (notice) showMessage(message, notice, 'success');
  await refresh();
});
