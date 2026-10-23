# MiauNote — seu cantinho de anotações

Aplicativo em HTML, CSS e JavaScript puro, sem frameworks, bundlers,
dependência de Node.js, CDNs ou imagens externas. A identidade visual usa gatos,
patinhas e tons pastel; as anotações continuam integradas à API existente.

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
O backend existente já possui essa configuração, com `allow_credentials=False`.
O cliente usa JWT no cabeçalho, sem cookies de autenticação.

Um site HTTPS hospedado não deve apontar para uma API HTTP local. Esta entrega
foi preparada para execução local. Se houver falha de conexão, confira a API,
o endereço e o CORS; o Swagger funcionar não garante acesso entre origens.

## Páginas e módulos

- `index.html` / `js/login.js`: login e validação de sessão existente.
- `cadastro.html` / `js/register.js`: cadastro; confirmação de senha fica apenas
  na interface. Após sucesso, retorna ao login com aviso descartável.
- `inicio.html` / `js/home.js` / `js/tasks.js`: painel com lista real, busca local,
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

O visual usa rosa pastel, lilás, creme, detalhes felinos e fontes locais. Há labels visíveis, foco
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

Não há recuperação de senha, refresh token ou reabertura de tarefas.
