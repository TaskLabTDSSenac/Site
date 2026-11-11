import { test, expect } from '@playwright/test';

test('CT-03 — Mostrar e ocultar senha no login', async ({ page }) => {
  await page.goto('/index.html');

  const senha = page.getByLabel('Senha', { exact: true });
  const alternar = page.getByRole('button', { name: 'Mostrar ou ocultar senha' });
  await senha.fill('SenhaTeste123');
  await alternar.click();
  await expect(senha).toHaveAttribute('type', 'text');
  await expect(alternar).toHaveAttribute('aria-pressed', 'true');

  await alternar.click();
  await expect(senha).toHaveAttribute('type', 'password');
  await expect(alternar).toHaveAttribute('aria-pressed', 'false');
});

test('CT-04 — Impedir cadastro com campos obrigatórios vazios', async ({ page }) => {
  await page.goto('/cadastro.html');

  const nome = page.getByLabel('Nome', { exact: true });
  const email = page.getByLabel('E-mail', { exact: true });
  const senha = page.getByLabel('Senha', { exact: true });
  const confirmacao = page.getByLabel('Confirmação da senha', { exact: true });

  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();

  await expect.poll(() => nome.evaluate(campo => campo.validity.valueMissing)).toBe(true);
  await expect.poll(() => email.evaluate(campo => campo.validity.valueMissing)).toBe(true);
  await expect.poll(() => senha.evaluate(campo => campo.validity.valueMissing)).toBe(true);
  await expect.poll(() => confirmacao.evaluate(campo => campo.validity.valueMissing)).toBe(true);
  await expect(page).toHaveURL(/\/cadastro\.html$/);
});

test('CT-05 — Rejeitar senha de cadastro com menos de 8 caracteres', async ({ page }) => {
  await page.goto('/cadastro.html');
  await page.getByLabel('Nome', { exact: true }).fill('Aluno Teste');
  await page.getByLabel('E-mail', { exact: true }).fill('ct05@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('123456');
  await page.getByLabel('Confirmação da senha', { exact: true }).fill('123456');

  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();

  await expect(page.getByRole('status')).toHaveText('A senha deve ter entre 8 e 128 caracteres.');
  await expect(page).toHaveURL(/\/cadastro\.html$/);
});
