import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';

const api = 'http://127.0.0.1:8000';

async function criarSessao(page) {
  const id = randomUUID();
  const email = `ct-tarefa-${id}@example.com`;
  const senha = 'SenhaSegura123';
  const cadastro = await page.request.post(`${api}/auth/register`, {
    data: { name: 'Aluno Teste Tarefas', email, password: senha },
  });
  expect(cadastro.status(), 'A API deve criar o usuário de preparação.').toBe(201);

  const login = await page.request.post(`${api}/auth/login`, {
    data: { email, password: senha },
  });
  expect(login.status(), 'A API deve autenticar o usuário de preparação.').toBe(200);
  const { access_token: token } = await login.json();
  await page.goto('/index.html');
  await page.evaluate(accessToken => sessionStorage.setItem('tasklab_access_token', accessToken), token);
}

async function criarTarefa(page, titulo) {
  await page.goto('/tarefa.html');
  await page.getByLabel('Título', { exact: true }).fill(titulo);
  const aguardandoResposta = page.waitForResponse(response =>
    response.request().method() === 'POST'
    && new URL(response.url()).pathname === '/tasks'
  );
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  const resposta = await aguardandoResposta;
  expect(resposta.status()).toBe(201);
  await page.goto('/inicio.html');
  await expect(page.getByRole('heading', { name: titulo, exact: true })).toBeVisible();
}

test('CT-08 — Concluir tarefa', async ({ page }) => {
  const titulo = `Tarefa para concluir ${randomUUID()}`;
  await criarSessao(page);
  await criarTarefa(page, titulo);

  const tarefa = page.locator('.task-card').filter({ has: page.getByRole('heading', { name: titulo, exact: true }) });
  await tarefa.getByRole('button', { name: 'Concluir', exact: true }).click();

  await expect(tarefa.locator('.status')).toHaveText('Concluída');
  await expect(page.getByRole('status')).toContainText('Tarefa concluída com sucesso.');
});

test('CT-09 — Excluir tarefa e confirmar', async ({ page }) => {
  const titulo = `Tarefa para excluir ${randomUUID()}`;
  await criarSessao(page);
  await criarTarefa(page, titulo);

  const tarefa = page.locator('.task-card').filter({ has: page.getByRole('heading', { name: titulo, exact: true }) });
  await tarefa.getByRole('button', { name: 'Excluir', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Excluir tarefa', exact: true }).click();

  await expect(page.getByRole('heading', { name: titulo, exact: true })).toHaveCount(0);
  await expect(page.getByRole('status')).toContainText('Tarefa excluída com sucesso.');
});

test('CT-10 — Cancelar exclusão mantém a tarefa', async ({ page }) => {
  const titulo = `Tarefa para manter ${randomUUID()}`;
  await criarSessao(page);
  await criarTarefa(page, titulo);

  const tarefa = page.locator('.task-card').filter({ has: page.getByRole('heading', { name: titulo, exact: true }) });
  await tarefa.getByRole('button', { name: 'Excluir', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Cancelar', exact: true }).click();

  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('heading', { name: titulo, exact: true })).toBeVisible();
});
