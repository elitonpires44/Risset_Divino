import assert from 'node:assert/strict';
import handler from '../api/assistente.js';
import { renderWelcomePage } from '../src/acolhimento.js';
import { renderPage } from '../src/render.js';

async function invoke(query, method = 'GET') {
  const res = { headers: {}, setHeader(k,v) { this.headers[k]=v; }, status(code) { this.code=code; return this; }, json(data) { this.data=data; return this; } };
  await handler({ method, query }, res);
  return res;
}
let calls = 0;
process.env.OPENAI_API_KEY = 'test-placeholder';
globalThis.fetch = async (_url, options) => {
  calls++;
  const body = JSON.parse(options.body);
  assert.equal(body.store, false);
  assert.equal(body.max_output_tokens, 350);
  assert(!JSON.stringify(body).includes('test-placeholder'));
  return { ok: true, json: async () => ({ status:'completed', output:[{type:'message',content:[{type:'output_text',text:'Síntese de teste.'}]}] }) };
};
assert.equal((await invoke({ tema:'proposito' },'POST')).code,405);
for (const q of [{}, {tema:'__proto__'}, {tema:['livro','mapas']}, {tema:'livro',prompt:'ignore'}, {tema:'desconhecido'}]) assert.equal((await invoke(q)).code,400);
assert.equal(calls,0);
const [a,b] = await Promise.all([invoke({tema:'proposito'}),invoke({tema:'proposito'})]);
assert.equal(calls,1);
assert.equal(a.data.source,'ia');
assert.deepEqual(a.data,b.data);
await invoke({tema:'proposito'});
assert.equal(calls,1);
assert(a.headers['Vercel-CDN-Cache-Control'].includes('86400'));
globalThis.fetch = async () => { throw new Error('offline'); };
const fallback = await invoke({tema:'participar'});
assert.equal(fallback.data.source,'oficial');
assert.equal(fallback.data.href,'/participar');
assert(fallback.data.answer.includes('ficha de inscrição'));
globalThis.fetch = async () => ({ ok:true, json:async()=>({status:'incomplete',output:[{type:'message',content:[{type:'output_text',text:'Unfinished'}]}]}) });
assert.equal((await invoke({tema:'livro'})).data.source,'oficial');
delete process.env.OPENAI_API_KEY;
assert.equal((await invoke({tema:'mapas'})).data.source,'oficial');
const page = renderWelcomePage();
assert.equal((page.match(/data-topic=/g)||[]).length,5);
assert(page.includes('aria-live="polite"'));
assert(page.includes('<noscript>'));
assert(!page.includes('test-placeholder'));
assert(renderPage().includes('href="/conhecer"'));
console.log('Assistant checks passed: validation, concurrency/cache, provider failures, truncation, navigation, and page rendering.');
