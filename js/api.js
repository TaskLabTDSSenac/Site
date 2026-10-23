import { API_BASE_URL } from './config.js';
import { getToken, expireSession } from './session.js';

export class ApiError extends Error {
  constructor(message, status = 0) { super(message); this.status = status; }
}
const fields = { name: 'Nome', email: 'E-mail', password: 'Senha', title: 'Título', description: 'Descrição', current_password: 'Senha atual', new_password: 'Nova senha' };
function errorMessage(detail, status) {
  if (status >= 500) return 'O servidor encontrou um problema. Tente novamente em instantes.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map(error => {
      const field = fields[error.loc?.at(-1)] || 'Dados enviados';
      const messages = {
        missing: 'campo obrigatório.', string_too_short: 'valor abaixo do tamanho mínimo.',
        string_too_long: 'valor acima do tamanho máximo.', extra_forbidden: 'campo não permitido.',
        value_error: 'formato inválido.', string_type: 'informe um texto válido.'
      };
      return `${field}: ${messages[error.type] || 'confira o valor informado.'}`;
    }).join(' ');
  }
  if (status === 401) return 'E-mail ou senha inválidos.';
  if (status === 409) return 'E-mail já cadastrado.';
  if (status >= 500) return 'O servidor encontrou um problema. Tente novamente em instantes.';
  return 'Não foi possível concluir a solicitação.';
}
export async function request(path, { method = 'GET', data, authenticated = false } = {}) {
  const headers = { Accept: 'application/json' };
  if (data !== undefined) headers['Content-Type'] = 'application/json';
  if (authenticated) {
    const token = getToken();
    if (!token) { expireSession(); throw new ApiError('Sua sessão expirou. Entre novamente.', 401); }
    headers.Authorization = `Bearer ${token}`;
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    let response;
    try {
      response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}${path}`, {
        method, headers, body: data === undefined ? undefined : JSON.stringify(data),
        signal: controller.signal
      });
    } catch {
      throw new ApiError('Não foi possível conectar à API. Confira se ela está em execução e se o CORS permite este endereço.');
    }
    if (authenticated && response.status === 401) {
      expireSession();
      throw new ApiError('Sua sessão expirou. Entre novamente.', 401);
    }
    if (response.status === 204) return null;
    let text;
    try { text = await response.text(); }
    catch { throw new ApiError('A conexão com a API foi interrompida. Tente novamente.'); }
    let body = null;
    if (text) {
      try { body = JSON.parse(text); } catch {
        if (!response.ok) throw new ApiError(errorMessage(null, response.status), response.status);
        throw new ApiError('A API retornou uma resposta inesperada. Tente novamente.', response.status);
      }
    }
    if (!response.ok) throw new ApiError(errorMessage(body?.detail, response.status), response.status);
    return body;
  } finally { clearTimeout(timeout); }
}
// O texto recebido nunca é interpretado como HTML.
export function showMessage(element, text, kind = 'error') {
  element.textContent = text;
  element.dataset.kind = kind;
  element.hidden = !text;
}
export function setupPasswordToggles() {
  document.querySelectorAll('[data-toggle-password]').forEach(button => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.togglePassword);
      const reveal = input.type === 'password';
      input.type = reveal ? 'text' : 'password';
      button.textContent = reveal ? 'Ocultar' : 'Mostrar';
      button.setAttribute('aria-pressed', String(reveal));
    });
  });
}
