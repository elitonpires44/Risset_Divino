# Projeto Milênio - RISSET DIVINO

**A Família de Deus Ativa em Movimento.** Site institucional preservado e plataforma
administrativa em Next.js, com Supabase Auth, Postgres/RLS e Storage privado.

## Desenvolvimento

Node.js >=22 e npm:

```sh
npm ci
npm run dev
npm run check
npm run build
npm start
```

Copie `.env.example` para `.env.local` e configure as variáveis reais. Sem Supabase,
a Home permanece disponível e o login administrativo fica bloqueado. A demonstração
local é explícita e só funciona em desenvolvimento; não substitui a conexão real.

## Estrutura

- `src/`: conteúdo, renderer, identidade visual e mídias originais do site preservado.
- `app/`: Home, `/admin`, galeria, conteúdos, contato e recuperação de senha.
- `components/`: dashboard, editor e telas públicas.
- `lib/`: Supabase, repositório, regras editoriais e importação das artes existentes.
- `supabase/migrations/001_platform.sql`: schema, perfis, RLS, histórico e storage.
- `tests/`: testes de conteúdo, permissões e migração em Postgres embarcado.
- `scripts/prepare.mjs`: reconstrói mídias e prepara arquivos públicos para Next.js.

## Ativação, conteúdo e deploy

Leia [o guia de ativação](docs/ATIVACAO.md) para conectar o projeto Supabase,
criar o primeiro Super Admin, alimentar o site e publicar na Vercel. O WhatsApp
oficial pode ser preenchido em **Admin > Configurações** quando disponível.

Páginas, artes, estudos e acervo compartilham fluxo editorial, revisão, agendamento,
SEO, histórico e lixeira. A navegação inclui todas as áreas previstas no plano;
integrações especializadas e conteúdo ainda ausente estão identificados no guia.
Nenhuma chave administrativa ou conta de demonstração é embutida na produção.

## Validação

`npm run check` executa sete testes, incluindo a migração Postgres com políticas RLS,
negação de escalada de privilégios, isolamento de arquivos e publicação. Fluxos de
painel também foram exercitados em navegador com demonstração local. Login/SMTP e
Storage no projeto real devem ser validados após configurar a conexão.

O build estático anterior continua disponível via `npm run build:static` para
referência; o deploy da plataforma usa Next.js, não a pasta `dist`.
