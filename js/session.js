const TOKEN_KEY = 'tasklab_access_token';
const NOTICE_KEY = 'tasklab_notice';
export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const setToken = token => sessionStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => sessionStorage.removeItem(TOKEN_KEY);
export function setNotice(value) { sessionStorage.setItem(NOTICE_KEY, value); }
export function takeNotice() {
  const value = sessionStorage.getItem(NOTICE_KEY);
  sessionStorage.removeItem(NOTICE_KEY);
  return value;
}
export function logout() {
  clearToken();
  window.location.replace('index.html');
}
export function expireSession() {
  clearToken();
  setNotice('expired');
  window.location.replace('index.html');
}
