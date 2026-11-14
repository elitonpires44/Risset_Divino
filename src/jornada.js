import { stages } from './content/jornada.js';
const esc = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const blocks = [
  { title: 'Entrada da Jornada', from: 0, to: 0 },
  { title: 'Bloco I · Origem e Propósito', from: 1, to: 3 },
  { title: 'Bloco II · Provisão e Redenção', from: 4, to: 6 },
  { title: 'Bloco III · Resposta e Caminhada', from: 7, to: 10 },
  { title: 'Bloco IV · Consumação', from: 11, to: 11 },
];
export function renderJourneyPage() {
  return `<!doctype html><html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>VV — O Verdadeiro Você | RISSET DIVINO</title>
<meta name="description" content="Conheça O Verdadeiro Você: uma jornada de fé, reflexão e vida prática, da Origem à esperança da promessa.">
<link rel="stylesheet" href="/jornada.css"><script src="/jornada.js" defer></script>
</head><body><a class="skip" href="#conteudo">Ir para o conteúdo</a>
<header class="journey-header"><a href="/" class="brand">MILÊNIO · RISSET DIVINO</a><nav aria-label="Navegação principal"><a href="/">Início</a><a href="#etapas">A Jornada</a><a href="/conhecer">Conhecer o Projeto</a></nav></header>
<main id="conteudo"><section class="journey-hero" aria-labelledby="vv-title">
<div class="hero-copy"><p class="eyebrow">Conheça o VV</p><h1 id="vv-title">O Verdadeiro<br><span>Você</span></h1>
<p class="question">Para onde está caminhando?</p><p>Você pode começar como está e onde estiver, com suas perguntas, suas dificuldades e sua esperança.</p>
<p>Conheça Jesus Cristo, compreenda sua graça e responda pela fé ao chamado à reconciliação com o Pai.</p>
<a class="gold-action" href="#etapa-0">Dê o primeiro passo</a><a class="text-action" href="#etapas">Ver as doze etapas</a>
<p class="hero-foot">Servindo com gratidão,<br>perseverando na esperança.</p></div>
<figure class="poster"><a href="/assets/vv-portal.webp" target="_blank" rel="noopener" aria-label="Abrir a arte O Verdadeiro Você em tamanho completo"><img src="/assets/vv-portal.webp" width="941" height="1672" alt="Convite O Verdadeiro Você: portal gótico dourado inteiramente aberto, caminho iluminado e a mensagem VV é sua identidade da Origem. Dê o primeiro passo."></a><figcaption>Toque na arte para ampliar.</figcaption></figure>
</section>
<section class="reading-guide" aria-labelledby="como-title"><p class="eyebrow">Uma camada de cada vez</p><h2 id="como-title">Leia. Reflita. Viva.</h2><p>Em cada etapa, acolha a mensagem, consulte a passagem bíblica, reflita sobre a pergunta e escolha uma atitude possível. Suas reflexões podem permanecer privadas.</p>
<dl><div><dt>Graça</dt><dd>Dádiva de Deus.</dd></div><div><dt>Fé</dt><dd>Confiança em Jesus Cristo.</dd></div><div><dt>Reconciliação</dt><dd>Relação com Deus restaurada por meio de Cristo.</dd></div></dl></section>
<section class="stages" id="etapas" aria-labelledby="etapas-title"><p class="eyebrow">Da Origem à Origem</p><h2 id="etapas-title">Encontre seu próximo passo.</h2>
<nav class="stage-index" aria-label="Escolher etapa">${stages.map(s=>`<a href="#etapa-${s.number}" aria-label="Etapa ${s.number}: ${esc(s.title)}">${s.number}</a>`).join('')}</nav>
${blocks.map(block=>`<section class="block" aria-label="${esc(block.title)}"><h3>${esc(block.title)}</h3>${stages.filter(s=>s.number>=block.from && s.number<=block.to).map(s=>`<details id="etapa-${s.number}" ${s.number===0?'open':''}><summary><span class="stage-number">${s.number}</span><span>${esc(s.title)}</span></summary><div class="stage-body"><p>${esc(s.message)}</p><h4>Leitura bíblica</h4><p>${esc(s.reading)}</p><h4>Para refletir</h4><p>${esc(s.question)}</p><h4>Um passo na vida diária</h4><p>${esc(s.practice)}</p><p class="transition">${esc(s.transition)}</p>${s.number<11?`<a class="next-step" href="#etapa-${s.number+1}">Continuar para a etapa ${s.number+1} <span aria-hidden="true">→</span></a>`:'<a class="next-step" href="#etapa-0">Retomar a pergunta inicial</a>'}</div></details>`).join('')}</section>`).join('')}
</section>
<section class="closing"><p class="eyebrow">A Família de Deus Ativa em Movimento</p><h2>Uma vida que expressa o amor recebido.</h2><p>Receber com gratidão, cuidar com consciência e compartilhar com justiça, para que outros também tenham oportunidade.</p><a class="gold-action" href="/conhecer">Conhecer mais sobre o Projeto</a><p class="privacy">Você pode ler e refletir sem preencher cadastro. Se desejar registrar seu interesse, a <a href="/participar">ficha de participação</a> está disponível.</p></section>
</main><footer>Projeto Milênio — RISSET DIVINO<br>Eliton Pires de Oliveira · Roteiro introdutório de 0 a 11</footer></body></html>`;
}
