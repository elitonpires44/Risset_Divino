const buttons = [...document.querySelectorAll('[data-topic]')];
const section = document.getElementById('response');
const title = document.getElementById('answer-title');
const answer = document.getElementById('answer');
const source = document.getElementById('source');
const next = document.getElementById('next');
const allowed = new Set(['/#proposito', '/#obra', '/#plano', '/#movimento', '/participar']);
const saved = new Map();

for (const button of buttons) button.addEventListener('click', async () => {
  buttons.forEach(b => { b.disabled = true; b.setAttribute('aria-pressed', String(b === button)); });
  section.setAttribute('aria-busy', 'true');
  title.textContent = button.textContent;
  answer.textContent = 'Preparando a apresentação…';
  source.textContent = '';
  next.hidden = true;
  try {
    const topic = button.dataset.topic;
    let data = saved.get(topic);
    if (!data) {
      const response = await fetch(`/api/assistente?tema=${encodeURIComponent(topic)}`, { signal: AbortSignal.timeout(18000) });
      if (!response.ok) throw new Error('Unavailable');
      data = await response.json();
      if (typeof data.answer !== 'string' || !allowed.has(data.href) || typeof data.label !== 'string') throw new Error('Invalid response');
      saved.set(topic, data);
    }
    answer.textContent = data.answer;
    source.textContent = data.source === 'ia' ? 'Síntese com IA, baseada no conteúdo oficial. Confira a fonte no link abaixo.' : 'Texto oficial do Projeto RISSET DIVINO.';
    next.href = data.href;
    next.textContent = data.label;
    next.hidden = false;
  } catch {
    answer.textContent = 'Não foi possível carregar agora. Você pode conhecer o projeto diretamente ou tentar escolher o tema novamente.';
    next.href = '/#proposito';
    next.textContent = 'Acessar o conteúdo oficial';
    next.hidden = false;
  } finally {
    section.setAttribute('aria-busy', 'false');
    buttons.forEach(b => { b.disabled = false; });
  }
});
