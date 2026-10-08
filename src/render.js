import { site as defaultSite } from "./content/site.js";

const favicon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%2307192f'/%3E%3Ccircle cx='32' cy='32' r='23' fill='none' stroke='%23d7ae4a' stroke-width='4'/%3E%3Cpath d='M32 10v44M18 28h28' stroke='%23fff4c4' stroke-width='5' stroke-linecap='round'/%3E%3Cpath d='M32 8l4 11 12 1-9 8 3 12-10-6-10 6 3-12-9-8 12-1z' fill='%23d7ae4a' opacity='.2'/%3E%3C/svg%3E";

function attrs(attributes) {
  return Object.entries(attributes)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== false,
    )
    .map(([key, value]) => (value === true ? key : `${key}="${value}"`))
    .join(" ");
}

const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
function image({ src, alt }, className = "", eager = false) {
  const dimensions = src.includes("logo-risset")
    ? [1254, 1254]
    : /plano-divino|sete-promulgacoes/.test(src)
      ? [1672, 941]
      : [1536, 1024];
  return `<img ${attrs({ src: src.startsWith("./assets/") ? src.replace(".png", ".webp") : src, alt: alt, width: dimensions[0], height: dimensions[1], loading: eager ? "eager" : "lazy", decoding: "async", fetchpriority: eager ? "high" : undefined, class: className || undefined })} />`;
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

function safeContent(value, key = "") {
  if (Array.isArray(value)) return value.map((item) => safeContent(item, key));
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, safeContent(v, k)]),
    );
  if (typeof value !== "string") return value;
  if (["src", "href"].includes(key)) {
    if (!/^(https:\/\/|\.\/|\/(?!\/)|#|mailto:)/.test(value)) return "#contato";
    return escape(value);
  }
  return escape(value);
}

export function renderPage(options = {}) {
  const site = safeContent(options.content || defaultSite);
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
      <details class="navigation" open>
        <summary>Menu</summary>
        <nav aria-label="Seções do site">
        ${site.nav.map((item) => `<a href="${item.href}">${item.label}</a>`).join("")}
      </nav>
      </details>
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
            <audio id="ambientAudio" src="/assets/risset-tema-instrumental.wav" loop preload="none"></audio>
          </div>
          <div class="hero-signature">
            ${site.hero.signatures.map((item) => `<span>${item}</span>`).join("")}
          </div>
        </div>
        <figure class="hero-showcase" aria-label="Arte principal do Projeto Milênio RISSET DIVINO">
          ${image(site.hero.image, "", true)}
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
          .map(
            ([number, title, text]) =>
              `<article><span>${number}</span><h3>${title}</h3><p>${text}</p></article>`,
          )
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
        <a href="${visual.image.src}" target="_blank" rel="noopener" aria-label="${escape(`Abrir arte completa: ${visual.image.alt}`)}">${image(visual.image)}</a>
        <figcaption>Selecione a arte para visualizar em tamanho original.</figcaption>
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

  function renderCta(whatsappNumber) {
    return `
    <section class="final-call" id="participar" aria-labelledby="participar-title">
      <p class="section-kicker">${site.cta.kicker}</p>
      <h2 id="participar-title">${site.cta.title}</h2>
      <p>${site.cta.text}</p>
      <a class="participate" href="${whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Quero participar do Projeto Milênio - RISSET DIVINO.")}` : site.cta.href}" ${whatsappNumber ? 'target="_blank" rel="noopener"' : ""}>${site.cta.label}</a>
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

  function renderDocument({
    siteUrl = process.env.SITE_URL,
    contactEmail = process.env.CONTACT_EMAIL,
    whatsappNumber = process.env.WHATSAPP_NUMBER,
  } = {}) {
    let canonical = "";
    if (siteUrl) {
      const url = new URL(siteUrl);
      if (
        url.protocol !== "https:" ||
        url.username ||
        url.password ||
        url.search ||
        url.hash ||
        url.pathname !== "/"
      )
        throw new Error(
          "SITE_URL deve ser a origem HTTPS oficial, sem caminhos ou credenciais.",
        );
      canonical = url.origin + "/";
    }
    if (contactEmail && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(contactEmail))
      throw new Error("CONTACT_EMAIL inválido");
    if (whatsappNumber && !/^\d{10,15}$/.test(whatsappNumber))
      throw new Error(
        "WHATSAPP_NUMBER deve conter apenas dígitos com código do país.",
      );
    const contact = `<section class="intro contact" id="contato"><p class="section-kicker">Contato institucional</p><h2>Vamos conversar.</h2><p>Conheça o Projeto Milênio - RISSET DIVINO e participe desta obra.</p>${contactEmail ? `<p><a href="mailto:${escape(contactEmail)}">${escape(contactEmail)}</a></p>` : ""}${whatsappNumber ? `<a class="participate" href="https://wa.me/${whatsappNumber}" target="_blank" rel="noopener">Conversar pelo WhatsApp</a>` : contactEmail ? "" : "<p>Os canais oficiais de contato serão disponibilizados em breve.</p>"}</section>`;

    return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${site.displayTitle}</title>
    <meta name="description" content="${site.description}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:title" content="${site.displayTitle}" />
    <meta property="og:description" content="${site.description}" />
    <meta name="twitter:card" content="summary_large_image" />
    ${canonical ? `<link rel="canonical" href="${escape(canonical)}" /><meta property="og:url" content="${escape(canonical)}" /><meta property="og:image" content="${escape(canonical)}assets/hero-risset-divino.png" /><meta name="twitter:image" content="${escape(canonical)}assets/hero-risset-divino.png" /><script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: site.displayTitle, url: canonical, inLanguage: "pt-BR" }).replace(/</g, "\\u003c")}</script>` : ""}
    <link rel="stylesheet" href="/styles.css" />
    <script src="/app.js" defer></script>
    <link rel="icon" type="image/svg+xml" href="${favicon}" />
  </head>
  <body>
    <a class="skip-link" href="#inicio">Pular para o conteúdo</a>
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
      ${renderCta(whatsappNumber)}
      ${contact}
    </main>
    ${renderFooter()}
  </body>
</html>
`;
  }

  return renderDocument(options);
}
