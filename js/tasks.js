import { showMessage } from './api.js';
import { takeNotice } from './session.js';
import { mountProtected } from './protected.js';
import { listTasks } from './tasks-service.js';
import { runTaskAction } from './task-actions.js';

const list = document.getElementById('task-list');
const message = document.getElementById('task-message');
const retry = document.getElementById('tasks-retry');
const search = document.getElementById('note-search');
let allTasks = [];
let loading = false;

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function addIcon(node, pathData) {
  const namespace = 'http://www.w3.org/2000/svg';
  const icon = document.createElementNS(namespace, 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(namespace, 'path');
  path.setAttribute('d', pathData);
  icon.append(path);
  node.prepend(icon);
}

function renderTasks() {
  const query = search.value.trim().toLocaleLowerCase('pt-BR');
  const tasks = allTasks.filter(task => `${task.title} ${task.description || ''}`.toLocaleLowerCase('pt-BR').includes(query));
  list.replaceChildren();
  document.getElementById('empty').hidden = allTasks.length !== 0;
  search.closest('.search-box').hidden = allTasks.length === 0;
  document.getElementById('no-results').hidden = allTasks.length === 0 || tasks.length !== 0;
  for (const task of tasks) {
    const card = element('article', undefined, 'task-card');
    card.append(element('span', task.completed ? 'Concluída' : 'Em andamento', `status ${task.completed ? 'done' : 'pending'}`));
    card.append(element('h2', task.title));
    const description = task.description || 'Sem detalhes adicionais no relatório.';
    card.append(element('p', description.length > 180 ? description.slice(0, 180) + '…' : description, 'task-summary'));
    const actions = element('div', undefined, 'actions');
    for (const [label, url, actionClass] of [['Abrir relatório', 'tarefa-detalhes.html', 'action-open'], ['Editar relatório', 'tarefa.html', 'action-edit']]) {
      const link = element('a', label, `paper-button ${actionClass}`);
      link.href = `${url}?id=${encodeURIComponent(task.id)}`;
      link.title = label === 'Abrir relatório' ? 'Consultar todos os detalhes da missão' : 'Alterar o título ou a descrição';
      addIcon(link, actionClass === 'action-open'
        ? 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'
        : 'M4 16.5V20h3.5L19 8.5 15.5 5 4 16.5ZM20 7.5 16.5 4 18 2.5 21.5 6 20 7.5Z');
      actions.append(link);
    }
    for (const [kind, label] of [['complete', 'Concluir missão'], ['delete', 'Apagar relatório']]) {
      if (kind === 'complete' && task.completed) continue;
      const button = element('button', label, `paper-button ${kind === 'delete' ? 'danger action-delete' : 'action-complete'}`);
      button.type = 'button';
      button.title = kind === 'delete' ? 'Apagar este relatório permanentemente' : 'Marcar esta missão como concluída';
      addIcon(button, kind === 'delete'
        ? 'M4 7h16M9 7V4h6v3m3 0-.8 13H6.8L6 7m4 3v6m4-6v6'
        : 'm5 12 4 4L19 6');
      button.addEventListener('click', () => runTaskAction(kind, task, actions, message, refresh, async () => {
        showMessage(message, 'Relatório removido do arquivo.', 'success');
        await refresh();
      }));
      actions.append(button);
    }
    card.append(actions);
    list.append(card);
  }
}

search.addEventListener('input', renderTasks);

async function refresh() {
  if (loading) return;
  loading = true;
  document.getElementById('tasks-loading').hidden = false;
  retry.hidden = true;
  try {
    allTasks = await listTasks();
    renderTasks();
  } catch (error) {
    if (error.status !== 401) { showMessage(message, error.message); retry.hidden = false; }
  } finally { loading = false; document.getElementById('tasks-loading').hidden = true; }
}

retry.addEventListener('click', refresh);
mountProtected(async () => {
  const notices = {
    'task-created': 'Missão registrada no arquivo.',
    'task-updated': 'Relatório de missão atualizado.',
    'task-deleted': 'Relatório removido do arquivo.'
  };
  const notice = notices[takeNotice()];
  if (notice) showMessage(message, notice, 'success');
  await refresh();
});
