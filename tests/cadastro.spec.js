import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';

test('CT-02 — Não permitir cadastro com senha inferior a 8 caracteres', async ({ page }) => {
  // Preparação: dados válidos nos demais campos e um e-mail novo a cada execução.
  await page.goto('/cadastro.html');
  await page.getByLabel('Nome', { exact: true }).fill('Aluno Teste');
  await page.getByLabel('E-mail', { exact: true }).fill(`ct02-${randomUUID()}@example.com`);
  const senha = page.getByLabel('Senha', { exact: true });
  await senha.fill('123456');
  await page.getByLabel('Confirmação da senha', { exact: true }).fill('123456');

  // Apenas observa a comunicação real, sem interceptar ou simular respostas.
  let respostaCadastro;
  let falhaDeRede;
  const cadastro = request => request.method() === 'POST'
    && new URL(request.url()).pathname === '/auth/register';
  page.on('response', response => {
    if (cadastro(response.request())) respostaCadastro = response;
  });
  page.on('requestfailed', request => {
    if (cadastro(request)) falhaDeRede = request.failure()?.errorText;
  });

  // Ação: tenta cadastrar pelos controles reais da página.
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();

  // Aguarda um resultado observável: HTML nativo, mensagem JavaScript ou API.
  let resultado;
  await expect.poll(async () => {
    if (falhaDeRede) throw new Error(`Infraestrutura: falha de rede/CORS: ${falhaDeRede}`);
    if (respostaCadastro) {
      resultado = 'api';
    } else if (new URL(page.url()).pathname === '/index.html') {
      resultado = 'cadastro aceito';
    } else if (await senha.evaluate(input => input.validity.tooShort)) {
      resultado = 'html';
    } else if (await page.getByRole('status').isVisible()
      && await page.getByRole('status').textContent() === 'A senha deve ter entre 8 e 128 caracteres.') {
      resultado = 'javascript';
    }
    return resultado;
  }, { message: 'Aguardar rejeição da senha ou resposta real do cadastro.' }).toBeTruthy();

  // Verificação: sucesso no cadastro é um defeito, nunca um resultado aprovado.
  expect(resultado, 'Uma senha de 6 caracteres não deve permitir o cadastro.').not.toBe('cadastro aceito');
  if (resultado === 'api') {
    if (respostaCadastro.status() >= 500) {
      throw new Error(`Infraestrutura: API respondeu HTTP ${respostaCadastro.status()}.`);
    }
    expect(respostaCadastro.status(), 'Contrato: rejeitar senha curta com HTTP 422.').toBe(422);
    // Confirma que a rejeição foi causada pelo tamanho da senha, não por outro campo.
    const corpo = await respostaCadastro.json();
    expect(corpo.detail).toEqual(expect.arrayContaining([
      expect.objectContaining({ loc: ['body', 'password'], type: 'string_too_short' }),
    ]));
    await expect(page.getByRole('status')).toContainText('Senha: valor abaixo do tamanho mínimo.');
  }
  await expect(page).toHaveURL(/\/cadastro\.html$/);
});


test('CT-01 — Cadastrar usuário com sucesso', async ({ page }) => {
  // Preparação: dados válidos e e-mail exclusivo para evitar cadastro duplicado.
  const nome = 'Aluno Cadastro Valido';
  const email = `ct01-${randomUUID()}@example.com`;
  const senha = 'SenhaSegura123';

  await page.goto('/cadastro.html');
  await page.getByLabel('Nome', { exact: true }).fill(nome);
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(senha);
  await page.getByLabel('Confirmação da senha', { exact: true }).fill(senha);

  // Começa a observar a resposta antes do clique para não perder o evento.
  const aguardandoResposta = page.waitForResponse(response =>
    response.request().method() === 'POST'
    && new URL(response.url()).pathname === '/auth/register'
  );
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  const resposta = await aguardandoResposta;

  // Verificação: API confirma a criação do usuário.
  expect(resposta.status()).toBe(201);

  // A interface retorna ao login e informa o sucesso do cadastro.
  await expect(page).toHaveURL(/\/index\.html$/);
  await expect(page.getByRole('status')).toHaveText(
    'Conta criada com sucesso. Faça login para continuar.'
  );
  await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeVisible();
});
