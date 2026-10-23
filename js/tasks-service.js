import { request } from './api.js';

const taskPath = id => `/tasks/${encodeURIComponent(id)}`;
export const listTasks = () => request('/tasks', { authenticated: true });
export const getTask = id => request(taskPath(id), { authenticated: true });
export const createTask = data => request('/tasks', { method: 'POST', data, authenticated: true });
export const updateTask = (id, data) => request(taskPath(id), { method: 'PUT', data, authenticated: true });
export const completeTask = id => request(`${taskPath(id)}/complete`, { method: 'PATCH', authenticated: true });
export const deleteTask = id => request(taskPath(id), { method: 'DELETE', authenticated: true });
