import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';

const senha = 'SenhaSegura123';

async function registrarEEntrar(page, caso) {
  const email = `${caso}-${randomUUID()}@example.com`;

  // Cada caso usa uma conta nova, criada pela interface real do sistema.
  await page.goto('/cadastro.html');
  await page.getByLabel('Nome', { exact: true }).fill(`Aluno ${caso}`);
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(senha);
  await page.getByLabel('Confirmação da senha', { exact: true }).fill(senha);
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  await expect(page).toHaveURL(/\/index\.html$/);

  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(senha);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(/\/inicio\.html$/);
  await expect(page.getByRole('heading', { name: 'Meu grimório de tarefas' })).toBeVisible();
}

test('CT-06 — Criar tarefa com todos os campos preenchidos', async ({ page }) => {
  const titulo = `CT-06 tarefa ${randomUUID()}`;
  const descricao = 'Descrição de teste para criação de tarefa.';
  await registrarEEntrar(page, 'ct06');

  await page.locator('.page-heading').getByRole('link', { name: 'Criar tarefa', exact: true }).click();
  await expect(page).toHaveURL(/\/tarefa\.html$/);
  await page.getByLabel('Título', { exact: true }).fill(titulo);
  await page.getByLabel(/Descrição/).fill(descricao);
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();

  await expect(page).toHaveURL(/\/inicio\.html$/);
  await expect(page.getByRole('status')).toHaveText('Tarefa criada com sucesso.');
  const tarefa = page.locator('article.task-card').filter({
    has: page.getByRole('heading', { name: titulo, exact: true }),
  });
  await expect(tarefa).toBeVisible();
  await expect(tarefa).toContainText(descricao);
});

test('CT-10 — Editar uma tarefa existente', async ({ page }) => {
  const tituloOriginal = `CT-10 original ${randomUUID()}`;
  const tituloAtualizado = `CT-10 atualizado ${randomUUID()}`;
  await registrarEEntrar(page, 'ct10');

  await page.locator('.page-heading').getByRole('link', { name: 'Criar tarefa', exact: true }).click();
  await page.getByLabel('Título', { exact: true }).fill(tituloOriginal);
  await page.getByLabel(/Descrição/).fill('Tarefa criada para o teste de edição.');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();

  const tarefa = page.locator('article.task-card').filter({
    has: page.getByRole('heading', { name: tituloOriginal, exact: true }),
  });
  await expect(tarefa).toBeVisible();
  await tarefa.getByRole('link', { name: 'Editar', exact: true }).click();
  await expect(page).toHaveURL(/\/tarefa\.html\?id=\d+$/);
  await expect(page.getByLabel('Título', { exact: true })).toHaveValue(tituloOriginal);
  await page.getByLabel('Título', { exact: true }).fill(tituloAtualizado);
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();

  await expect(page).toHaveURL(/\/inicio\.html$/);
  await expect(page.getByRole('status')).toHaveText('Tarefa atualizada com sucesso.');
  await expect(page.getByRole('heading', { name: tituloAtualizado, exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: tituloOriginal, exact: true })).toHaveCount(0);
});

test('CT-12 — Excluir uma tarefa existente', async ({ page }) => {
  const titulo = `CT-12 excluir ${randomUUID()}`;
  await registrarEEntrar(page, 'ct12');

  await page.locator('.page-heading').getByRole('link', { name: 'Criar tarefa', exact: true }).click();
  await page.getByLabel('Título', { exact: true }).fill(titulo);
  await page.getByLabel(/Descrição/).fill('Tarefa criada para o teste de exclusão.');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();

  const tarefa = page.locator('article.task-card').filter({
    has: page.getByRole('heading', { name: titulo, exact: true }),
  });
  await expect(tarefa).toBeVisible();
  await tarefa.getByRole('link', { name: 'Visualizar', exact: true }).click();
  await expect(page).toHaveURL(/\/tarefa-detalhes\.html\?id=\d+$/);
  await expect(page.getByRole('heading', { name: titulo, exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Excluir', exact: true }).click();
  const dialogo = page.getByRole('dialog', { name: 'Excluir tarefa?' });
  await expect(dialogo).toBeVisible();
  await expect(dialogo).toContainText(titulo);
  await dialogo.getByRole('button', { name: 'Excluir tarefa', exact: true }).click();

  await expect(page).toHaveURL(/\/inicio\.html$/);
  await expect(page.getByRole('status')).toHaveText('Tarefa excluída com sucesso.');
  await expect(page.getByRole('heading', { name: titulo, exact: true })).toHaveCount(0);
});
