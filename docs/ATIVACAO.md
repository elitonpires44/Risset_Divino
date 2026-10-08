# Ativação da plataforma RISSET DIVINO

A base institucional existente foi preservada e incorporada ao Next.js. O painel
usa Supabase Auth, Postgres com RLS e um bucket privado. Não há usuário, senha ou
chave administrativa embutida no código.

## 1. Conectar o projeto informado

Projeto: `vytlpndofvmrzckodqcz`.

Nas configurações seguras do ambiente e do projeto Vercel, configure:

- `NEXT_PUBLIC_SUPABASE_URL=https://vytlpndofvmrzckodqcz.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: chave **anon/pública** encontrada em Supabase >
  Project Settings > API. Não use `service_role` neste campo.
- `SITE_URL`: domínio HTTPS oficial quando disponível.

As duas primeiras variáveis são públicas por desenho do Supabase; RLS protege os
dados. Elas são incorporadas no build, portanto faça novo deploy após alterá-las.
Não envie senhas ou chaves administrativas pelo chat. O acesso de rede ao hostname
`vytlpndofvmrzckodqcz.supabase.co` precisa estar habilitado no ambiente Codex.

## 2. Aplicar banco e storage

No SQL Editor do **projeto correto**, revise e execute
`supabase/migrations/001_platform.sql`. A migração é transacional e destinada à
primeira instalação: não execute novamente sobre as mesmas tabelas. Se já houver
tabelas com esses nomes, faça backup e ajuste a migração em tarefa própria antes
de aplicar. Não apague dados existentes para fazer a instalação passar.

A migração cria cadastros de conteúdo, configurações, perfis, contatos, versões,
logs e backups; também cria `risset-media` como bucket **privado**. Tabelas usam
RLS, publicação depende de status/acesso/data, e URLs de arquivos são temporárias.
Não desabilite RLS para corrigir problemas de acesso.

## 3. Criar o primeiro Super Admin

1. Em Supabase Auth > Users, crie ou convide seu usuário com seu e-mail real.
2. Copie o UUID desse usuário e execute no SQL Editor:

```sql
update public.profiles set role = 'super_admin', display_name = 'Administração RISSET DIVINO'
where id = '<UUID_DO_USUARIO_AUTH>';
```

3. Configure Supabase Auth > URL Configuration com o domínio público oficial e
   autorize `<dominio>/recuperar-senha` como redirect. Para teste local, autorize
   também o endereço local utilizado.
4. Configure o envio de e-mail/SMTP para convites e recuperação de senha.
5. Acesse `/admin`, autentique-se e importe as artes existentes pela Visão Geral.
6. Em Configurações, revise a identidade e publique os dados oficiais. WhatsApp e
   e-mail podem ser preenchidos depois. Publique uma política de privacidade
   aprovada antes de liberar o formulário.

Os papéis não vêm de metadados editáveis pelo usuário. Contas novas começam como
`membro`; apenas o Super Admin atribui acesso administrativo. Convites e remoção
de contas são operados no Supabase Auth nesta versão.

## 4. Alimentar a plataforma

- **Home:** todos os textos, artes, navegação, chamadas e rodapé ficam em
  Configurações > Conteúdo completo da Home. Salvar publica as configurações.
- **Páginas, estudos e acervo:** cadastre conteúdo, revise e marque `publicado` com
  acesso `publico`. As entradas aparecem em `/conteudos`; artes em `/galeria`.
- **Artes:** identificação, leitura espiritual, referências, direitos, série,
  catálogo, usos, SEO e publicação são campos próprios. Os originais são mantidos.
- **Upload em lote:** permitido com conexão real; arquivos entram como rascunhos
  internos. Imagens recebem versões web e miniatura, além do original. Se um
  cadastro falhar depois do envio, o painel informa o caminho para recuperação.
- **Editor:** Markdown com títulos, links, imagens, citações e tabelas. HTML bruto
  não é executado. Use a pré-visualização para revisar.
- **Agendamento:** selecione status publicado, acesso público e uma data futura.
  O banco libera a leitura quando a data chega; não precisa de cron.
- **Versões:** cada edição guarda o estado anterior. Carregue uma versão como
  rascunho, revise e salve. Lixeira e arquivamento preservam os arquivos e o histórico.
- **CRM:** Super Admin e Gestor acompanham mensagens e exportam CSV. Dados pessoais
  não aparecem em consultas públicas.
- **Backups:** exportam cadastros e versões; permitem restaurar cadastros, configurações e contatos sem apagar itens posteriores. Não incluem binários nem credenciais
  Auth. Faça também backups do banco e Storage pelo Supabase.

## 5. Validar e publicar

```sh
npm ci
npm run check
npm run build
npm start -- --port 3000
```

Na Vercel importe este repositório usando o preset Next.js. `vercel.json` já
seleciona o framework. Configure as variáveis, faça deploy de teste e valide:

- Home com identidade e artes preservadas; menu em celular.
- Login, recuperação e acesso negado para membro.
- Editor cria rascunho, Revisor publica e Colaborador vê só seus próprios cadastros.
- Arte pública aparece na galeria; interna não aparece nem libera arquivo.
- Configuração de WhatsApp/e-mail aparece na Home após publicação.
- Formulário com consentimento cria contato visível apenas aos responsáveis.
- Conteúdo agendado não aparece antes do horário; lixeira sai da área pública.

## 6. O que foi e não foi validado

Testes executados localmente: build Next.js, renderer preservado, segurança de URLs,
visibilidade e política de funções; migração e RLS em Postgres embarcado PGlite.
PGlite simula schemas `auth`/`storage` e papéis do Supabase para testar políticas;
não substitui teste de login, SMTP e upload no projeto real.

A demonstração é opcional, só em desenvolvimento: `NEXT_PUBLIC_DEMO_MODE=true npm
run dev`. Dados ficam separados no navegador e não alimentam o site real. Nunca
habilite essa variável em produção; o build de produção impede demonstração.

## 7. Limites desta entrega e próximas integrações

A arquitetura contempla os módulos do plano mestre. RISSETV, Livro, Instituto,
Membros, Doações, Formulários, SEO, Idiomas e Tarefas usam cadastros editoriais
compartilhados. Isso não equivale a transmissão de vídeo, checkout financeiro,
cursos, certificados, geração de contratos ou construtor de formulários.

Traduções podem ser cadastradas e vinculadas; o site público desta entrega usa
português. Rotas por idioma, analytics, agendamento de backups, restauração de binários e credenciais, gestão de convites Auth por painel e permissões configuráveis por área
precisam de implementação específica. A Home tem edição completa de campos
existentes; inserção/remoção de blocos arbitrários e editor visual de layouts são
extensões futuras. O painel carrega até 1.000 linhas por área; acervos maiores
exigem paginação no servidor.

O conteúdo de outros chats não foi recuperado. Somente as cinco artes já presentes
no repositório e os rascunhos de GPS Divino/Formação têm importação inicial. Os PDFs
anexados são planos técnicos, não estudos espirituais aprovados para publicação.

A ativação no projeto Supabase, e-mails, mídias reais, domínio e deploy Vercel ainda
precisam de validação no ambiente conectado. Não considere o painel operacional
somente porque o código foi enviado ao GitHub.

## Teste de interface reproduzível

Inicie `NEXT_PUBLIC_DEMO_MODE=true npm run dev -- --port 3001`. Em outro terminal,
execute `node scripts/smoke-browser.mjs`. Instale o Chromium do Playwright com
`npx playwright install chromium` ou configure `CHROMIUM_PATH` para um Chromium
existente. `SMOKE_URL` altera o destino; use o hostname localhost para seguir a
política de origens de desenvolvimento do Next.js. O teste cria dados apenas na
demonstração, verifica edição/publicação/restauração e não utiliza contas reais.
