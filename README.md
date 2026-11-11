# TaskLab Web — Seu grimório de tarefas

Frontend didático em HTML, CSS e JavaScript puro, sem frameworks, bundlers,
dependência de Node.js, CDNs ou imagens externas. Projeto educacional inspirado
no universo de Harry Potter, sem vínculo oficial.

## Executar

1. Inicie a API na pasta `Api`, em um terminal, na porta 8000.
2. Na pasta `Site`, execute `.\iniciar.bat` em outro terminal.
3. Acesse http://127.0.0.1:5500. Não abra os HTML por `file://`.

O servidor estático usa `py -3.12 -m http.server 5500 --bind 127.0.0.1`.
Python 3.12 e seu launcher `py` são necessários apenas para servir os arquivos.

## API e CORS

O endereço fica centralizado em `js/config.js`, em `API_BASE_URL`, com padrão
`http://127.0.0.1:8000`. A API deve permitir as origens
`http://127.0.0.1:5500` e `http://localhost:5500`, os métodos GET, POST, PUT,
PATCH, DELETE e OPTIONS e os cabeçalhos Authorization e Content-Type.
O backend do TaskLab já possui essa configuração, com `allow_credentials=False`.
O cliente usa JWT no cabeçalho, sem cookies de autenticação.

Um site HTTPS hospedado não deve apontar para uma API HTTP local. Esta entrega
foi preparada para execução local. Se houver falha de conexão, confira a API,
o endereço e o CORS; o Swagger funcionar não garante acesso entre origens.

## Páginas e módulos

- `index.html` / `js/login.js`: login e validação de sessão existente.
- `cadastro.html` / `js/register.js`: cadastro; confirmação de senha fica apenas
  na interface. Após sucesso, retorna ao login com aviso descartável.
- `inicio.html` / `js/home.js` / `js/tasks.js`: painel com lista real, situação,
  estado vazio, carregamento, nova tentativa e ações por tarefa.
- `tarefa.html` / `js/task-form.js`: criação sem ID; edição com `?id=123`.
- `tarefa-detalhes.html` / `js/task-details.js`: consulta com `?id=123`, datas
  em pt-BR no horário local, descrição com quebras de linha e ações.
- `perfil.html` / `js/profile.js`: dados pessoais e formulário independente
  para alteração de senha.
- `js/tasks-service.js`: chamadas HTTP de tarefas, sem regras duplicadas nas telas.
- `js/task-actions.js`: conclusão e confirmação de exclusão compartilhadas.
- `js/protected.js`: validação de sessão, cabeçalho, IDs e estados de envio.
- `js/api.js`: JSON, Bearer opcional, respostas vazias/204, timeout e erros.
- `js/session.js`: armazenamento centralizado do token, avisos e logout.
- `css/style.css`: identidade e componentes compartilhados, com variáveis CSS.

## Tarefas

Cada página protegida consulta `GET /users/me` antes de revelar seus dados.
O painel usa `GET /tasks` e não cria contadores ou tarefas fictícias.
As ações correspondem aos contratos reais:

| Ação | Requisição |
| --- | --- |
| Criar | POST /tasks |
| Listar | GET /tasks |
| Consultar | GET /tasks/{id} |
| Editar | PUT /tasks/{id} |
| Concluir | PATCH /tasks/{id}/complete, sem corpo |
| Excluir | DELETE /tasks/{id}, resposta 204 sem corpo |

Criação e edição enviam somente `title` e `description`. O título é aparado e
deve ter de 3 a 150 caracteres; a descrição aceita até 500. Descrição vazia é
enviada como `null` e limpa o valor anterior no PUT. Os formulários preservam
o conteúdo em falhas e bloqueiam submissões repetidas. IDs devem ser inteiros
positivos representáveis pelo SQLite.

Não há reabertura de tarefas. Uma conclusão que retorna 400 mostra a mensagem
da API e recarrega a tarefa/lista. Exclusão exige confirmação em diálogo nativo,
com título inserido como texto, Cancelar, Excluir tarefa, Escape e retorno de foco.
Nenhuma tarefa é removida ou marcada como concluída antes da confirmação da API.

## Perfil e pendência de backend

O `/openapi.json` da API foi consultado e **não oferece atualização de nome/e-mail**.
Por isso, os campos são preenchidos, mas **Salvar dados permanece desabilitado**,
com aviso visível. Não há sucesso simulado nem gravação apenas local.

`updateProfile` em `js/profile.js` está preparada para o contrato proposto
`PATCH /users/me` com `{name, email}` e resposta `{id, name, email}`. A constante
`PROFILE_UPDATE_AVAILABLE` permanece `false`. Ative-a somente depois de confirmar
que o backend implementa esse contrato, incluindo 409 e 422. Nenhuma mudança de
backend foi feita nesta etapa.

A troca de senha está funcional: `PATCH /users/me/password` envia somente
`current_password` e `new_password`. A confirmação pertence à interface.
Senha atual: 1 a 128 caracteres. Nova senha: 8 a 128 caracteres. Espaços são
preservados. Após sucesso, os três campos são limpos e a sessão continua ativa.
Tokens antigos permanecem válidos até expirar, conforme a política sem revogação.

## Segurança, erros e acessibilidade

O token usa `sessionStorage`, chave `tasklab_access_token`; senhas não são
armazenadas nem registradas no console. O armazenamento é acessível por JavaScript
e exige proteção contra XSS. Dados da API entram por `textContent`, nunca por
`innerHTML`. A validação da interface não substitui validação/autorização do servidor.

Um 401 autenticado limpa o token e redireciona ao login com aviso. Falha de rede
ou 500 preserva o token e oferece nova tentativa. O logout é apenas local.
Erros textuais e listas 422 são tratados com mensagens em português; não se
exibem objetos brutos ou detalhes internos de erros 500.

O visual preserva azul-noturno, dourado, pergaminhos e o emblema original de livro
e estrela. SVGs são decorativos e fontes são locais. Há labels visíveis, foco
evidente, mensagens com aria-live, navegação por teclado e respeito à preferência
por movimento reduzido. A navegação e as ações se adaptam a telas de 360px.

## Verificação manual

1. Cadastre e autentique uma conta. Confira a lista vazia.
2. Crie uma tarefa; abra seus detalhes; edite título e descrição.
3. Conclua e confirme que a ação Concluir desaparece.
4. Cancele uma exclusão e depois confirme; verifique a lista atualizada.
5. Experimente título de dois caracteres, descrição acima de 500 e ID inexistente.
6. No perfil, confirme o aviso de edição pendente. Teste confirmação de senha
   divergente e depois uma troca válida. Faça novo login com a senha nova.
7. Teste Sair, acesso direto sem token, token inválido e API indisponível.
8. Navegue por teclado, feche o diálogo com Escape e confira em desktop e 360px.

Foram exercitados fluxos no Chrome headless com uma instância real da API em
banco SQLite temporário. As verificações incluíram CRUD, senha, logout, erros,
retorno de foco do diálogo e largura de 360px. A prévia de verificação usou um
proxy local apenas no ambiente temporário; os arquivos entregues usam o endereço
normal de `js/config.js`. O banco da demonstração não recebeu dados de verificação.
Edição de nome/e-mail não pôde ser validada porque sua rota ainda não existe.

Não há recuperação de senha, refresh token, reabertura de tarefas ou seleção de casa.

## Testes funcionais Web com Playwright

O site continua funcionando sem Node.js. Node.js e npm são necessários apenas
para a automação. Use Node.js LTS compatível com Playwright (22 ou 24), Python
3.12 para servir o site e a API com suas dependências já instaladas.

Há dois testes: **CT-01 — Cadastrar usuário com sucesso** e
**CT-02 — Não permitir cadastro com senha inferior a 8 caracteres**. A expectativa correta é rejeitar a senha. Os defeitos didáticos
da aplicação não são corrigidos nem contornados pelo teste.

### Instalação no Windows

Abra um terminal na pasta `TaskLab\Site`:

```powershell
npm install
```
Instala `@playwright/test` e suas dependências. O `package-lock.json` registra
as versões; mantenha esse arquivo no Git.

```powershell
npx playwright install chromium
```
Instala o Chromium usado pelo Playwright. Não é necessário instalar Firefox
ou WebKit nesta etapa.

### Iniciar a API e o site manualmente

**Os testes Web usam a API real e podem gravar dados. Use ambiente e banco
exclusivos de testes, sem contas reais.** Um e-mail exclusivo evita conflitos,
mas não impede a gravação: com o defeito ativo, cada execução pode criar uma conta.
Não há limpeza automática pela interface.

Encerre qualquer API de desenvolvimento na porta 8000 antes de iniciar a API
de testes. Em um terminal na pasta `TaskLab\Api`:

```powershell
$env:DATABASE_URL = 'sqlite:///tasklab_web_testes.db'
```
Seleciona um SQLite exclusivo dos testes Web, criado na pasta atual. Esse banco
é diferente de `tasklab.db` e do SQLite temporário dos testes pytest.

```powershell
$env:JWT_SECRET_KEY = & .\.venv\Scripts\python.exe -c "import secrets; print(secrets.token_hex(32))"
```
Gera uma chave exclusiva para a sessão de testes, sem modificar o `.env`.

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Inicia a API manualmente com as variáveis acima. **Não use o `iniciar.bat` da API
para este procedimento**, pois ele força `DATABASE_URL` para o banco principal.
O endereço configurado no Site é `http://127.0.0.1:8000` em `js/config.js`.
Feche esse terminal ao terminar, para descartar as variáveis da sessão.

Em outro terminal, na pasta `TaskLab\Site`:

```powershell
.\iniciar.bat
```
Serve os arquivos em `http://127.0.0.1:5500`. A API deve permitir essa origem
no CORS. O cadastro fica em `/cadastro.html`. Mantenha ambos os terminais abertos.
O Playwright não inicia nem encerra esses servidores automaticamente.

### Executar o CT-02 e consultar evidências

Em um terceiro terminal, na pasta `TaskLab\Site`:

```powershell
.\iniciar_testes.bat
```
Confere Node.js, npm, dependências e Chromium; orienta o preparo quando faltar
algo e executa o teste com navegador visível. Mantém a janela aberta e devolve
o código de saída dos testes. Não instala dependências automaticamente.

```powershell
npm test
```
Executa os dois testes em Chromium sem janela visível, com um worker e sem retries.

```powershell
npm run test:headed
```
Executa o mesmo teste mostrando o navegador. É o comando usado pelo arquivo BAT.

```powershell
npm run test:report
```
Abre o relatório HTML da última execução. Em falhas, consulte a captura de tela
e o trace, que mostram a página, as ações e a comunicação. Não publique esses
arquivos: podem conter dados preenchidos e respostas da API.

```powershell
npx playwright test --list
```
Lista os dois casos sem abrir o navegador nem enviar requisições à API.

### Arquivos e conceitos

| Arquivo | Função |
| --- | --- |
| `package.json` | Dependência e scripts npm, usando módulos ES como o site. |
| `package-lock.json` | Versões exatas das dependências instaladas. |
| `playwright.config.js` | Endereço do site, Chromium, um worker, zero retries, relatório, screenshot e trace em falhas. |
| `tests/cadastro.spec.js` | CT-01 e CT-02, pela interface real. |
| `iniciar_testes.bat` | Execução assistida no Windows. |
| `.gitignore` | Exclui dependências, relatórios, resultados e arquivos de credenciais/sessão. |

- `test`: declara um caso de teste e seu nome no relatório.
- `page`: representa uma aba do navegador, inicialmente sem sessão de usuário.
- `await`: aguarda uma operação assíncrona antes de continuar, como preencher ou clicar.
- `locator`: localiza um elemento. `getByLabel` usa o label do campo;
  `getByRole` usa seu papel e nome acessível, como o botão Criar conta.
- `expect`: compara o resultado observado com o esperado. `expect.poll` consulta
  um resultado até ele aparecer ou o prazo acabar; não usa uma pausa fixa.

### O que o CT-02 faz

1. Abre a página real `cadastro.html`.
2. Preenche nome válido e e-mail fictício exclusivo gerado com UUID.
3. Preenche senha e confirmação com `123456`.
4. Clica no botão **Criar conta**, sem remover atributos ou alterar validações.
5. Observa o resultado real. Aceita como proteção o HTML indicar senha curta,
   o JavaScript mostrar sua mensagem real de tamanho de senha, ou a API retornar
   422 especificamente pelo tamanho do campo `password`, com erro exibido na tela.
6. Confirma que a página continua no cadastro. Se a API retornar 201 ou houver
   redirecionamento de sucesso para o login, o teste falha.

A tela atual permite seis caracteres no HTML (`minlength="6"`) e no JavaScript.
Assim, hoje o envio chega à API. Se ela aceitar, o resultado será **FAILED**.
Se futuramente o frontend bloquear antes do envio, o teste poderá passar pela
proteção da interface, mas isso **não comprova a validação da API**: use pytest
para verificar o contrato diretamente no backend.

### Interpretar o resultado

- **PASSED**: o cadastro foi rejeitado por uma das validações verificadas.
- **FAILED por regra de negócio**: por exemplo, a API retornou 201 quando deveria
  retornar 422. Registre o defeito; não mude a expectativa para 201.
- **Falha de infraestrutura**: site/API desligados, Chromium ausente, erro de
  rede/CORS, timeout ou HTTP 500. Também aparece como falha na ferramenta, mas
  não comprova o defeito de senha. Corrija o ambiente antes de avaliar o cenário.

Um erro genérico de conexão, e-mail duplicado ou qualquer mensagem de erro não
é considerado aprovação do CT-02. Não há interceptação nem simulação da API.

### Verificação desta entrega

Os servidores das portas 5500 e 8000 estavam indisponíveis durante o preparo.
A validação de estrutura e execução está descrita na entrega; o fluxo real de
cadastro só pode ser confirmado com os dois servidores iniciados manualmente.

Verificacoes executadas: dependencias e Chromium instalados; descoberta de exatamente
um teste; BAT executado com navegador visivel, um worker e codigo de saida 1.
A execucao parou em ERR_CONNECTION_REFUSED na pagina de cadastro, pois o site
estava desligado. Relatorio HTML, screenshot e trace foram gerados. O fluxo
real de cadastro nao foi validado e nenhum usuario foi cadastrado nessa execucao.


### CT-01 — Cadastro com sucesso

```powershell
npm run test:headed -- --grep "CT-01"
```
Executa somente o cadastro válido, com navegador visível. A API e o Site devem
estar iniciados. O teste cria uma conta fictícia com e-mail exclusivo e senha
`SenhaSegura123`, confirma HTTP 201, o redirecionamento
para `index.html` e a mensagem “Conta criada com sucesso. Faça login para continuar.”.
Esse caso grava um usuário na API real; utilize o banco exclusivo dos testes Web.
O CT-02 permanece com sua expectativa de rejeitar a senha curta.
