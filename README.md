# TaskLab Web

Frontend didático em HTML5, CSS3 e JavaScript puro, com módulos e Fetch. Não exige Node.js, bundler, framework ou CDN.

## Executar localmente

1. Inicie a API pelo `iniciar.bat` da pasta **Api**, em um terminal (porta 8000).
2. Na pasta **Site**, execute `.\iniciar.bat` em outro terminal. Requer Python 3.12 e o launcher `py`.
3. Acesse **http://127.0.0.1:5500**. Não abra os HTML por `file://`, pois os scripts usam módulos.

O servidor web executa `py -3.12 -m http.server 5500 --bind 127.0.0.1`. A porta 8000 ? reservada ? API.

## API e CORS

Altere `API_BASE_URL` em `js/config.js` se necessário. O padrão ? `http://127.0.0.1:8000`.
O backend deve permitir a origem `http://127.0.0.1:5500`, métodos GET/POST e cabeçalhos Content-Type e Authorization. `localhost` ? uma origem diferente de `127.0.0.1`.

Exemplo de configuração necessária na API FastAPI, após criar `app`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)
```

A API existente não foi alterada nesta etapa. Sem CORS, o navegador pode bloquear a integração mesmo quando o Swagger funciona. Um site hospedado em HTTPS não deve apontar para uma API HTTP local; esta entrega foi preparada para execução local.

## Arquivos e comportamento

- `index.html` e `js/login.js`: login, visibilidade da senha, validação de sessão existente e mensagens de sucesso/erro.
- `cadastro.html` e `js/register.js`: cadastro com confirmação local de senha; envia somente name, email e password. Após sucesso, volta ao login, sem autenticação automática.
- `inicio.html` e `js/home.js`: perfil carregado de `/users/me`, conteúdo oculto até validar, nova tentativa em falhas e logout local.
- `css/style.css`: identidade visual azul, layout responsivo, foco visível e fontes do sistema.
- `js/config.js`: endereço da API.
- `js/api.js`: cliente HTTP, JSON, respostas vazias/204, erros textuais ou listas 422, timeout e mensagens de conexão/CORS.
- `js/session.js`: token e avisos descartáveis centralizados; logout remove o token.
- `iniciar.bat`: servidor estático na porta 5500.

A interface valida campos obrigatórios, nome após trim, formato de e-mail, limites de senha e confirmação. As senhas não são aparadas. O servidor continua sendo a autoridade para validar dados e autorizar operações; validação no navegador não substitui a API.

## Sessão e segurança

O token fica em `sessionStorage`, na chave `tasklab_access_token`. Senhas nunca são armazenadas. O aviso de cadastro/sessão expirada usa um indicador descartável, sem colocar credenciais na URL. Authorization ? enviado somente nas chamadas autenticadas.

`sessionStorage` ? acessível por JavaScript: exige proteção contra XSS. Dados recebidos são inseridos com `textContent`, nunca como HTML, e não há scripts de CDN. Não registre credenciais no console. Esse armazenamento não torna o token imune a código malicioso.

O logout ? local: remove o token e retorna ao login, sem endpoint de logout. Tokens já emitidos continuam válidos até expirar. Um 401 no perfil limpa a sessão; falhas de rede e erros de servidor preservam o token e permitem tentar novamente. A presença do token não substitui sua validação pela API.

## Verificações manuais

Com API real e CORS configurados:

1. Cadastre uma conta: espere retornar ao login com “Conta criada com sucesso. Faça login para continuar.”
2. Informe confirmação diferente: o formulário deve impedir o envio.
3. Repita um e-mail: espere a mensagem de duplicidade.
4. Teste login incorreto e correto. O correto abre o perfil com nome e e-mail.
5. Sem token, abra `inicio.html`: deve voltar ao login.
6. Com token inválido/expirado, espere retorno ao login com aviso de sessão expirada.
7. Clique em Sair: o token deve desaparecer e o acesso ao perfil exigir novo login.
8. Desligue a API: espere mensagem de conexão/CORS; no perfil, token preservado e botão Tentar novamente.
9. Simule erro 500: token preservado e nova tentativa disponível.
10. Navegue com Tab/Shift+Tab/Enter e confira foco e botões Mostrar/Ocultar. Teste tela estreita de 360px sem rolagem horizontal.

A integração real e a verificação visual devem ser confirmadas no navegador com a API disponível. Não confundir testes com respostas simuladas com validação ponta a ponta.

## Escopo

Implementados login, cadastro, perfil protegido e logout local. Tarefas, alteração de senha, recuperação de senha e revogação de tokens não fazem parte desta etapa do frontend.
