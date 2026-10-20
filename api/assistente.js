import { topics } from '../src/content/acolhimento.js';

// Only five server-owned questions can reach the provider. No visitor text is sent.
const cache = new Map();
const pending = new Map();
const DAY = 86400000;

async function explain(id, topic) {
  const fallback = { answer: topic.text, source: 'oficial', href: topic.href, label: topic.label };
  if (!process.env.OPENAI_API_KEY) return fallback;
  try {
    const upstream = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      signal: AbortSignal.timeout(12000),
      headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        store: false,
        max_output_tokens: 350,
        instructions: 'Você apresenta o Projeto Milênio — RISSET DIVINO. Reescreva APENAS o texto oficial fornecido em português brasileiro simples e acolhedor, em até 100 palavras e dois parágrafos. Preserve nomes e fatos. Não acrescente informações, promessas, datas, contatos, citações bíblicas ou convites financeiros. Não fale como Deus, profeta ou autor. Não use Markdown nem links. Quando houver instrução de participação, preserve-a.',
        input: `${topic.title}\n\nTexto oficial:\n${topic.text}`,
      }),
    });
    if (!upstream.ok) {
      console.warn('Assistant provider unavailable', upstream.status);
      return fallback;
    }
    const data = await upstream.json();
    const answer = (data.output || []).filter(o => o.type === 'message')
      .flatMap(o => o.content || []).filter(c => c.type === 'output_text')
      .map(c => c.text).join('\n').trim();
    if (data.status !== 'completed' || !answer || answer.length > 2400) return fallback;
    return { ...fallback, answer, source: 'ia' };
  } catch {
    // Do not log prompts, credentials, visitor data, or provider response bodies.
    return fallback;
  }
}

export default async function handler(request, response) {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Método não permitido.' });
  }
  const query = request.query || {};
  const id = query.tema;
  if (Object.keys(query).length !== 1 || typeof id !== 'string' || !Object.hasOwn(topics, id)) {
    return response.status(400).json({ error: 'Escolha um dos temas disponíveis.' });
  }
  const topic = topics[id];
  let entry = cache.get(id);
  if (!entry || entry.expires <= Date.now()) {
    if (!pending.has(id)) {
      pending.set(id, explain(id, topic).then(value => {
        cache.set(id, { value, expires: Date.now() + (value.source === 'ia' ? DAY : 300000) });
        return value;
      }).finally(() => pending.delete(id)));
    }
    entry = { value: await pending.get(id) };
  }
  // Fixed query set + CDN cache + in-process deduplication reduce provider calls.
  // These are not an account-wide spending cap or a distributed rate limiter.
  response.setHeader('Cache-Control', 'public, max-age=0');
  response.setHeader('Vercel-CDN-Cache-Control', `public, s-maxage=${entry.value.source === 'ia' ? 86400 : 300}`);
  return response.status(200).json(entry.value);
}
