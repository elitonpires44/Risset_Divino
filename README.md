# Projeto Milênio - RISSET DIVINO

Site institucional oficial do **Projeto Milênio - RISSET DIVINO - A Família de Deus Ativa em Movimento**.

## Estrutura

- `src/content/site.js` - textos, navegação, seções e chamadas do projeto.
- `src/render.js` - composição HTML das seções.
- `src/styles/main.css` - identidade visual, responsividade e acabamento.
- `src/scripts/sound.js` - controle do tema instrumental.
- `src/assets-data/` - imagens e áudio aprovados em partes base64 para reconstrução no build.
- `scripts/build.mjs` - gera a versão publicada em `dist/`.
- `vercel.json` - configuração de build e saída para Vercel.

## Comandos

```sh
npm run check
npm run build
```

O deploy na Vercel usa `npm run build` e publica a pasta `dist/`.
