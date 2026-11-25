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
        actions.append(link);
      }
      for (const [kind, label] of [['complete', 'Concluir'], ['delete', 'Excluir']]) {
        const button = element('button', label, kind === 'delete' ? 'paper-button danger' : 'paper-button');
        button.type = 'button';
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
