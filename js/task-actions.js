import { completeTask, deleteTask } from './tasks-service.js';
import { showMessage } from './api.js';

export function confirmDelete(title) {
  const dialog = document.getElementById('delete-dialog');
  const previousFocus = document.activeElement;
  document.getElementById('delete-title').textContent = title;
  dialog.returnValue = 'cancel';
  return new Promise(resolve => {
    dialog.addEventListener('close', () => {
      if (previousFocus?.isConnected) previousFocus.focus();
      resolve(dialog.returnValue === 'delete');
    }, { once: true });
    dialog.showModal();
    dialog.querySelector('[value="cancel"]').focus();
  });
}

export async function runTaskAction(kind, task, group, message, refresh, onDeleted) {
  if (group.dataset.busy === 'true') return;
  const trigger = document.activeElement;
  group.dataset.busy = 'true';
  const buttons = [...group.querySelectorAll('button')];
  buttons.forEach(button => { button.disabled = true; });
  showMessage(message, '');
  try {
    if (kind === 'delete') {
      if (!await confirmDelete(task.title)) return;
      await deleteTask(task.id);
      await onDeleted();
    } else {
      try { await completeTask(task.id); }
      catch (error) {
        if (error.status === 400) {
          showMessage(message, error.message);
          await refresh();
          return;
        }
        throw error;
      }
      showMessage(message, 'Missão marcada como concluída.', 'success');
      await refresh();
    }
  } catch (error) {
    if (error.status !== 401) showMessage(message, error.message);
  } finally {
    group.dataset.busy = 'false';
    buttons.forEach(button => { button.disabled = false; });
    if (trigger?.isConnected) trigger.focus();
  }
}
