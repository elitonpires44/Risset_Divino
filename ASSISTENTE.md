# Acolhimento por temas

A rota `/conhecer` apresenta cinco temas derivados de `src/content/site.js`. O endpoint `/api/assistente?tema=proposito` aceita somente os cinco identificadores definidos no servidor; não aceita perguntas livres nem recebe dados do formulário de participação.

`OPENAI_API_KEY` é uma variável exclusiva do servidor, configurada na Vercel em Production. `OPENAI_MODEL` pode substituir o modelo padrão `gpt-4o-mini`. Verificar a disponibilidade do modelo ao fazer alterações futuras.

Cada resposta usa no máximo 350 tokens de saída, sem armazenamento de Responses (`store:false`), com timeout de 12 segundos. Respostas completas são reaproveitadas por 24 horas no processo e no cache da Vercel. Falhas usam o texto oficial, identificado como tal, por cinco minutos. Esses mecanismos reduzem chamadas; não estabelecem teto financeiro global nem limite distribuído de requisições. Os limites de conta/créditos OpenAI são independentes. Nenhuma alteração de faturamento foi feita.

As sínteses geradas são identificadas como IA e apontam para a seção oficial. A interface insere texto com `textContent`, sem executar HTML gerado. A orientação de fidelidade ao texto não garante ausência absoluta de erros; o conteúdo oficial continua disponível para conferência.

Verificação: `npm run check`, `node scripts/test-assistente.mjs` e `npm run build`. O fluxo público de inscrição permanece independente.
