import { site } from "./content/site.js";

const favicon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%2307192f'/%3E%3Ccircle cx='32' cy='32' r='23' fill='none' stroke='%23d7ae4a' stroke-width='4'/%3E%3Cpath d='M32 10v44M18 28h28' stroke='%23fff4c4' stroke-width='5' stroke-linecap='round'/%3E%3Cpath d='M32 8l4 11 12 1-9 8 3 12-10-6-10 6 3-12-9-8 12-1z' fill='%23d7ae4a' opacity='.2'/%3E%3C/svg%3E";

function attrs(attributes) {
  return Object.entries(attributes)
    .filter(([, value]) => value !== undefined && value !== null && value !== false)
    .map(([key, value]) => (value === true ? key : `${key}="${value}"`))
    .join(" ");
}

function image({ src, alt }, className = "") {
  return `<img ${attrs({ src, alt, class: className || undefined })} />`;
}

function sectionCopy({ kicker, title, text }) {
  return `
    <div class="section-copy">
      <p class="section-kicker">${kicker}</p>
      <h2>${title}</h2>
      <p>${text}</p>
    </div>
  `;
}

function renderHeader() {
  return `
    <header class="topbar" aria-label="Navegação principal">
      <a class="brand" href="#inicio" aria-label="${site.displayTitle}">
        <span class="brand-mark">${site.brand.mark}</span>
        <span>
          <strong>${site.brand.name}</strong>
          <small>${site.brand.subtitle}</small>
        </span>
      </a>
      <nav>
        ${site.nav.map((item) => `<a href="${item.href}">${item.label}</a>`).join("")}
      </nav>
    </header>
  `;
}

function renderHero() {
  return `
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-bg" role="img" aria-label="Identidade visual do Projeto Milênio RISSET DIVINO"></div>
      <div class="hero-stage">
        <div class="hero-content">
          <p class="eyebrow">${site.hero.eyebrow}</p>
          <h1 id="hero-title">${site.hero.title}</h1>
          <p class="lead">${site.hero.lead}</p>
          <p class="hero-note">${site.hero.note}</p>
          <div class="hero-actions" aria-label="Ações da abertura">
            <button class="sound-toggle" id="soundToggle" type="button" aria-pressed="false">
              <span class="sound-icon" aria-hidden="true"></span>
              <span class="sound-label">Ativar tema instrumental</span>
            </button>
            <audio id="ambientAudio" src="./assets/risset-tema-instrumental.wav" loop preload="auto"></audio>
          </div>
          <div class="hero-signature">
            ${site.hero.signatures.map((item) => `<span>${item}</span>`).join("")}
          </div>
        </div>
        <figure class="hero-showcase" aria-label="Arte principal do Projeto Milênio RISSET DIVINO">
          ${image(site.hero.image)}
        </figure>
      </div>
    </section>
  `;
}

function renderImpact() {
  return `
    <section class="impact-strip" aria-label="Síntese de impacto do projeto">
      ${site.impact.map(([title, text]) => `<article><strong>${title}</strong><span>${text}</span></article>`).join("")}
    </section>
  `;
}

function renderFoundations() {
  return `
    <section class="intro" id="proposito">
      <div class="section-kicker">${site.foundations.kicker}</div>
      <h2>${site.foundations.title}</h2>
      <p>${site.foundations.text}</p>
      <div class="truth-grid" aria-label="Fundamentos do projeto">
        ${site.foundations.items
          .map(([number, title, text]) => `<article><span>${number}</span><h3>${title}</h3><p>${text}</p></article>`)
          .join("")}
      </div>
    </section>
  `;
}

function renderBand() {
  return `
    <section class="band">
      <div>
        <p class="section-kicker">${site.band.kicker}</p>
        <h2>${site.band.title}</h2>
      </div>
      <p>${site.band.text}</p>
    </section>
  `;
}

function renderFlow() {
  return `
    <section class="portal-flow" aria-labelledby="portal-flow-title">
      <p class="section-kicker">${site.flow.kicker}</p>
      <h2 id="portal-flow-title">${site.flow.title}</h2>
      <div class="flow-grid">
        ${site.flow.items.map(([title, text]) => `<article><span>${title}</span><p>${text}</p></article>`).join("")}
      </div>
    </section>
  `;
}

function renderVisual(visual) {
  return `
    <section class="visual-section${visual.reverse ? " reverse" : ""}"${visual.id ? ` id="${visual.id}"` : ""}>
      ${sectionCopy(visual)}
      <figure class="image-frame wide">
        ${image(visual.image)}
      </figure>
    </section>
  `;
}

function renderBook() {
  return `
    <section class="book" id="obra">
      <div class="book-card">
        ${image(site.book.image)}
        <div>
          <p class="section-kicker">${site.book.kicker}</p>
          <h2>${site.book.title}</h2>
          <p>${site.book.text}</p>
          <dl>
            ${site.book.meta.map(([term, desc]) => `<div><dt>${term}</dt><dd>${desc}</dd></div>`).join("")}
          </dl>
        </div>
      </div>
    </section>
  `;
}

function renderMovement() {
  return `
    <section class="movement" id="movimento">
      <div class="movement-feature">
        ${sectionCopy(site.movement)}
        <figure class="image-frame identity">
          ${image(site.movement.image)}
        </figure>
      </div>
      <div class="movement-grid">
        ${site.movement.items.map(([title, text]) => `<article><h3>${title}</h3><p>${text}</p></article>`).join("")}
      </div>
    </section>
  `;
}

function renderCta() {
  return `
    <section class="final-call" aria-labelledby="participar-title">
      <p class="section-kicker">${site.cta.kicker}</p>
      <h2 id="participar-title">${site.cta.title}</h2>
      <p>${site.cta.text}</p>
      <a class="participate" href="${site.cta.href}" target="_blank" rel="noopener">${site.cta.label}</a>
    </section>
  `;
}

function renderFooter() {
  return `
    <footer>
      <p>${site.footer.project}</p>
      <p>${site.footer.line}</p>
    </footer>
  `;
}

export function renderPage() {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${site.displayTitle}</title>
    <meta name="description" content="${site.description}" />
    <link rel="stylesheet" href="./styles.css" />
    <script src="./app.js" defer></script>
    <link rel="icon" type="image/svg+xml" href="${favicon}" />
  </head>
  <body>
    ${renderHeader()}
    <main id="inicio">
      ${renderHero()}
      ${renderImpact()}
      ${renderFoundations()}
      ${renderBand()}
      ${renderFlow()}
      ${site.visuals.map(renderVisual).join("")}
      ${renderBook()}
      ${renderMovement()}
      ${renderCta()}
    </main>
    ${renderFooter()}
  </body>
</html>
`;
}
