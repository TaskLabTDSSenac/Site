import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';


test('CT-03 — Rejeitar login sem cadastro', async ({ page }) => {
  await page.goto('/index.html');
  await page.getByLabel('E-mail', { exact: true }).fill(`ct03-${randomUUID()}@example.com`);
  await page.getByLabel('Senha', { exact: true }).fill('SenhaInexistente123');

  const respostaLogin = page.waitForResponse(response =>
    response.request().method() === 'POST'
    && new URL(response.url()).pathname === '/auth/login'
  );
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  const resposta = await respostaLogin;

  expect(resposta.status()).toBe(401);
  await expect(page.getByRole('status')).toHaveText('E-mail ou senha inválidos.');
  await expect(page).toHaveURL(/\/index\.html$/);
});

test('CT-04 — Mostrar senha no login e no cadastro', async ({ page }) => {
  await page.goto('/index.html');
  const senhaLogin = page.getByLabel('Senha', { exact: true });
  await senhaLogin.fill('SenhaVisivel123');
  await page.getByRole('button', { name: 'Mostrar ou ocultar senha' }).click();
  await expect(senhaLogin).toHaveAttribute('type', 'text');
  await expect(page.getByRole('button', { name: 'Mostrar ou ocultar senha' })).toHaveAttribute('aria-pressed', 'true');

  await page.goto('/cadastro.html');
  const senhaCadastro = page.getByLabel('Senha', { exact: true });
  await senhaCadastro.fill('SenhaVisivel123');
  await page.getByRole('button', { name: 'Mostrar ou ocultar senha' }).first().click();
  await expect(senhaCadastro).toHaveAttribute('type', 'text');
});

test('CT-05 — Rejeitar cadastro com senha menor que 8 caracteres', async ({ page }) => {
  await page.goto('/cadastro.html');
  await page.getByLabel('Nome', { exact: true }).fill('Aluno Teste CT05');
  await page.getByLabel('E-mail', { exact: true }).fill(`ct05-${randomUUID()}@example.com`);
  await page.getByLabel('Senha', { exact: true }).fill('1234567');
  await page.getByLabel('Confirmação da senha', { exact: true }).fill('1234567');

  const respostaCadastro = page.waitForResponse(response =>
    response.request().method() === 'POST'
    && new URL(response.url()).pathname === '/auth/register'
  );
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  const resposta = await respostaCadastro;

  expect(resposta.status()).toBe(422);
  const corpo = await resposta.json();
  expect(corpo.detail).toEqual(expect.arrayContaining([
    expect.objectContaining({ loc: ['body', 'password'], type: 'string_too_short' }),
  ]));
  await expect(page.getByRole('status')).toContainText('Senha: valor abaixo do tamanho mínimo.');
  await expect(page).toHaveURL(/\/cadastro\.html$/);
});
