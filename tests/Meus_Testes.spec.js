import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';

test('CT-01 — Login rejeitado com senha incorreta', async ({ page, request }) => {
  const email = `ct-login-${randomUUID()}@example.com`;
  const senhaCorreta = 'SenhaSegura123';

  // Cria uma conta válida para garantir que o e-mail usado no login está cadastrado.
  const cadastro = await request.post('/auth/register', {
    data: { name: 'Aluno Teste', email, password: senhaCorreta },
  });
  expect(cadastro.status()).toBe(201);

  await page.goto('/index.html');
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill('SenhaIncorreta123');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();

  await expect(page.getByRole('status')).toContainText(/inválid|incorret|senha|credenciais/i);
  await expect(page).toHaveURL(/\/index\.html$/);
});

test('CT-02 — Login rejeitado sem e-mail e senha', async ({ page }) => {
  await page.goto('/index.html');
  const email = page.getByLabel('E-mail', { exact: true });
  const senha = page.getByLabel('Senha', { exact: true });

  await page.getByRole('button', { name: 'Entrar', exact: true }).click();

  // A validação required do navegador impede o envio do formulário vazio.
  await expect(page).toHaveURL(/\/index\.html$/);
  await expect(email).toHaveJSProperty('validity.valueMissing', true);
  await expect(senha).toHaveJSProperty('validity.valueMissing', true);
  await expect(page.getByRole('status')).toBeEmpty();
});

test('CT-03 — Cadastro rejeitado sem e-mail e senha', async ({ page }) => {
  await page.goto('/cadastro.html');
  const nome = page.getByLabel('Nome', { exact: true });
  const email = page.getByLabel('E-mail', { exact: true });
  const senha = page.getByLabel('Senha', { exact: true });
  const confirmacao = page.getByLabel('Confirmação da senha', { exact: true });

  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();

  // O formulário exige todos os campos e não deve tentar criar a conta.
  await expect(page).toHaveURL(/\/cadastro\.html$/);
  await expect(nome).toHaveJSProperty('validity.valueMissing', true);
  await expect(email).toHaveJSProperty('validity.valueMissing', true);
  await expect(senha).toHaveJSProperty('validity.valueMissing', true);
  await expect(confirmacao).toHaveJSProperty('validity.valueMissing', true);
  await expect(page.getByRole('status')).toBeEmpty();
});