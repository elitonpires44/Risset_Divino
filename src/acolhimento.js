import { topics } from './content/acolhimento.js';

export function renderWelcomePage() {
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Conheça o Projeto | RISSET DIVINO</title>
<meta name="description" content="Conheça o propósito, a obra e as formas de participar do Projeto Milênio — RISSET DIVINO.">
<style>
:root{color-scheme:dark;font-family:system-ui,sans-serif;background:#07192f;color:#f5f1e7}*{box-sizing:border-box}body{margin:0}a{color:#f4d68b;text-underline-offset:5px}header{max-width:1060px;margin:auto;padding:28px 24px;display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap}header a{text-decoration:none}main{max-width:960px;margin:32px auto 80px;padding:0 24px}.eyebrow{color:#e4c16e;letter-spacing:.14em;font-size:13px;text-transform:uppercase}h1{font:clamp(36px,6vw,64px)/1.1 Georgia,serif;max-width:750px;margin:18px 0}p{line-height:1.7;font-size:18px}.intro{max-width:680px;color:#c9d2de}.topics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:32px 0}button{font:inherit;color:inherit;cursor:pointer;border:1px solid #637183;border-radius:12px;padding:19px 20px;background:#112a46;text-align:left;min-height:64px}button:hover,button[aria-pressed=true]{border-color:#e4c16e;background:#1b3551}button:focus-visible,a:focus-visible{outline:3px solid #f4d68b;outline-offset:4px}button:disabled{opacity:.65;cursor:wait}.answer{border:1px solid #637183;border-radius:20px;padding:28px;background:linear-gradient(130deg,#142d49,#0a2039)}h2{font:28px/1.3 Georgia,serif;margin-top:0}#answer{white-space:pre-wrap;overflow-wrap:anywhere}#source,.note{font-size:14px;color:#bdc8d7}.action{display:inline-block;padding:13px 20px;border:1px solid #e4c16e;border-radius:30px;text-decoration:none;margin-top:12px}footer{border-top:1px solid #36475e;padding:24px;text-align:center;color:#bdc8d7;font-size:14px}[hidden]{display:none!important}@media(max-width:600px){main{margin-top:16px}.topics{grid-template-columns:1fr}.answer{padding:22px}header{font-size:14px}}
</style><script src="/acolhimento.js" defer></script></head>
<body><header><a href="/">RISSET DIVINO · Projeto Milênio</a><nav aria-label="Navegação"><a href="/">Início</a> · <a href="/participar">Participar</a></nav></header>
<main><p class="eyebrow">A Família de Deus Ativa em Movimento</p><h1>Um convite para conhecer e caminhar.</h1>
<p class="intro">Escolha um tema. Nosso assistente apresenta a mensagem do projeto em palavras simples, com acesso direto ao conteúdo oficial.</p>
<div class="topics" role="group" aria-label="Escolha um tema">${Object.entries(topics).map(([id,t])=>`<button type="button" data-topic="${id}" aria-pressed="false" aria-controls="response">${t.title}</button>`).join('')}</div>
<section class="answer" id="response" aria-live="polite" aria-atomic="true" aria-busy="false"><h2 id="answer-title">Seja bem-vindo.</h2><p id="answer">Comece pelo propósito do projeto ou escolha o tema que deseja conhecer.</p><p id="source">Respostas baseadas nos textos publicados neste site.</p><a class="action" id="next" href="/#proposito">Conhecer o propósito</a></section>
<p class="note">As sínteses podem ser preparadas com inteligência artificial. Confira sempre o conteúdo oficial pelos links. Esta consulta por temas não solicita dados pessoais.</p>
<noscript><p>Você pode acessar diretamente: <a href="/#proposito">Propósito</a>, <a href="/#obra">Livro</a>, <a href="/#plano">Mapas</a>, <a href="/#movimento">Movimento</a> e <a href="/participar">Participar</a>.</p></noscript>
</main><footer>Projeto Milênio — RISSET DIVINO · Plano · Padrão · Ordem · Propósito</footer></body></html>`;
}
