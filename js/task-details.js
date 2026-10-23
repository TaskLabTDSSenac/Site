import { mountProtected, taskId } from './protected.js';
import { getTask } from './tasks-service.js';
import { runTaskAction } from './task-actions.js';
import { setNotice } from './session.js';
let id;
let task;
const actions = document.getElementById('task-actions');
const message = document.getElementById('task-message');
const complete = document.getElementById('complete-task');
function date(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'Data indisponível' : parsed.toLocaleString('pt-BR');
}
async function refresh() {
  task = await getTask(id);
  document.getElementById('task-title').textContent = task.title;
  document.getElementById('task-description').textContent = task.description ?? 'Sem texto adicional';
  const status = document.getElementById('task-status');
  status.textContent = task.completed ? 'Feita' : 'Em andamento';
  status.className = `status ${task.completed ? 'done' : 'pending'}`;
  document.getElementById('created-at').textContent = date(task.created_at);
  document.getElementById('updated-at').textContent = date(task.updated_at);
  document.getElementById('edit-task').href = `tarefa.html?id=${encodeURIComponent(task.id)}`;
  complete.hidden = task.completed;
}
for (const [button, kind] of [[complete, 'complete'], [document.getElementById('delete-task'), 'delete']]) {
  button.addEventListener('click', () => runTaskAction(kind, task, actions, message, refresh, () => {
    setNotice('task-deleted');
    window.location.replace('inicio.html');
  }));
}
mountProtected(async () => { id = taskId(); await refresh(); });
