(() => {
  const menu = document.querySelector('.navigation');
  const mobile = matchMedia('(max-width: 1100px)');
  function syncMenu() { if (menu) menu.open = !mobile.matches; }
  syncMenu();
  mobile.addEventListener('change', syncMenu);
  menu?.addEventListener('click', (event) => { if (event.target.closest('a') && mobile.matches) menu.open = false; });
  menu?.addEventListener('keydown', (event) => { if (event.key === 'Escape' && mobile.matches) { menu.open = false; menu.querySelector('summary').focus(); } });
})();
(() => {
  const button = document.getElementById("soundToggle");
  if (!button) return;
  const label = button.querySelector(".sound-label");
  const audio = document.getElementById("ambientAudio");

  let active = false;
  let fadeFrame;

  function setLabel(isActive) {
    button.setAttribute("aria-pressed", String(isActive));
    if (label) label.textContent = isActive ? "Tema instrumental ligado" : "Ativar tema instrumental";
  }

  function fadeTo(target, duration = 1200, onComplete) {
    if (!audio) return;
    cancelAnimationFrame(fadeFrame);
    const start = audio.volume;
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      audio.volume = start + (target - start) * eased;
      if (progress < 1) {
        fadeFrame = requestAnimationFrame(step);
      } else if (onComplete) {
        onComplete();
      }
    }

    fadeFrame = requestAnimationFrame(step);
  }

  async function toggleSound() {
    if (!audio) {
      button.disabled = true;
      if (label) label.textContent = "Tema indisponível";
      return;
    }

    if (active) {
      active = false;
      fadeTo(0, 900, () => audio.pause());
      setLabel(false);
      return;
    }

    try {
      audio.volume = 0;
      await audio.play();
      active = true;
      fadeTo(0.78, 1600);
      setLabel(true);
    } catch (error) {
      if (label) label.textContent = "Toque novamente para ativar";
    }
  }

  button.addEventListener("click", toggleSound);
})();
