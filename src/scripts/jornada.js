function revealStage() {
  const id = window.location.hash.slice(1);
  if (!/^etapa-\d{1,2}$/.test(id)) return;
  const stage = document.getElementById(id);
  if (!stage || stage.tagName !== 'DETAILS') return;
  stage.open = true;
  stage.scrollIntoView({ block: 'start' });
  stage.querySelector('summary')?.focus({ preventScroll: true });
}
window.addEventListener('hashchange', revealStage);
revealStage();
