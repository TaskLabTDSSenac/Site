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

function renderTasks() {
  const query = search.value.trim().toLocaleLowerCase('pt-BR');
  const tasks = allTasks.filter(task => `${task.title} ${task.description || ''}`.toLocaleLowerCase('pt-BR').includes(query));
  list.replaceChildren();
  document.getElementById('empty').hidden = allTasks.length !== 0;
  document.getElementById('no-results').hidden = allTasks.length === 0 || tasks.length !== 0;
  for (const task of tasks) {
    const card = element('article', undefined, 'task-card');
    card.append(element('span', task.completed ? 'Concluída' : 'Em andamento', `status ${task.completed ? 'done' : 'pending'}`));
    card.append(element('h2', task.title));
    const description = task.description || 'Sem detalhes adicionais no relatório.';
    card.append(element('p', description.length > 180 ? description.slice(0, 180) + '…' : description, 'task-summary'));
    const actions = element('div', undefined, 'actions');
    for (const [label, url] of [['Abrir relatório', 'tarefa-detalhes.html'], ['Editar', 'tarefa.html']]) {
      const link = element('a', label, 'paper-button');
      link.href = `${url}?id=${encodeURIComponent(task.id)}`;
      actions.append(link);
    }
    for (const [kind, label] of [['complete', 'Concluir missão'], ['delete', 'Apagar']]) {
      if (kind === 'complete' && task.completed) continue;
      const button = element('button', label, kind === 'delete' ? 'paper-button danger' : 'paper-button');
      button.type = 'button';
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
