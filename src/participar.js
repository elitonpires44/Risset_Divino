import { site } from "./content/site.js";

export function renderParticipationPage() {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Participar | ${site.displayTitle}</title>
    <meta name="description" content="Apresentação e identificação voluntária de participantes do Projeto Milênio RISSET DIVINO." />
    <link rel="stylesheet" href="/styles.css" />
    <script src="/participar.js" defer></script>
  </head>
  <body class="participation-page">
    <header class="participation-header">
      <a class="brand" href="/" aria-label="Voltar ao início">
        <span class="brand-mark">RD</span>
        <span><strong>RISSET DIVINO</strong><small>Projeto Milênio</small></span>
      </a>
      <a class="back-link" href="/">Conhecer o Projeto</a>
    </header>
    <main>
      <section class="participation-hero">
        <p class="eyebrow">Congresso MEDADE · 29/10 a 01/11/2026</p>
        <h1>Da contemplação à participação.</h1>
        <p>O Projeto Milênio — RISSET DIVINO apresenta, com clareza e reverência, o Plano, o Padrão, a Ordem e o Propósito: Cristo no centro, as Escrituras em conferência e a Família de Deus ativa em movimento.</p>
        <div class="participation-pillars" aria-label="Síntese do Projeto">
          <span>Conhecer</span><span>Conferir</span><span>Servir</span><span>Multiplicar</span>
        </div>
      </section>
      <section class="participation-layout">
        <article class="participation-intro">
          <p class="section-kicker">Resposta do participante</p>
          <h2>Como você deseja caminhar conosco?</h2>
          <p>Este registro é voluntário. Ele nos ajuda a conhecer os congressistas e outras pessoas interessadas, seus dons, áreas de serviço e a melhor forma de prosseguir o diálogo.</p>
          <div class="participation-note">
            <strong>Uma obra sem fins lucrativos.</strong>
            <p>O Projeto não substitui a Bíblia, a Igreja ou a comunhão. Organiza a mensagem e conecta pessoas dispostas a servir com fé, responsabilidade e gratidão.</p>
          </div>
        </article>
        <form class="participation-form" id="participationForm">
          <div class="form-row">
            <label>Nome completo<input name="nome" autocomplete="name" required maxlength="120" /></label>
            <label>Cidade e Estado<input name="localidade" autocomplete="address-level2" required maxlength="120" placeholder="Ex.: Campinas — SP" /></label>
          </div>
          <label>E-mail<input name="email" type="email" autocomplete="email" required maxlength="160" /></label>
          <label>Como você se identifica?
            <select name="perfil" required>
              <option value="">Selecione</option>
              <option>Congressista</option><option>Associado(a)</option><option>Colaborador(a)</option>
              <option>Parceiro(a)</option><option>Participante independente</option>
              <option>Representante de instituição</option><option>Outro</option>
            </select>
          </label>
          <fieldset>
            <legend>Em que área deseja participar?</legend>
            <div class="choice-grid">
              <label><input type="checkbox" name="interesses" value="Conhecer o Projeto" /> Conhecer o Projeto</label>
              <label><input type="checkbox" name="interesses" value="Estudo e formação" /> Estudo e formação</label>
              <label><input type="checkbox" name="interesses" value="Comunicação e RISSETV" /> Comunicação e RISSETV</label>
              <label><input type="checkbox" name="interesses" value="Ação social e Instituto" /> Ação social e Instituto</label>
              <label><input type="checkbox" name="interesses" value="Parcerias e recursos" /> Parcerias e recursos</label>
              <label><input type="checkbox" name="interesses" value="Intercessão e apoio" /> Intercessão e apoio</label>
            </div>
          </fieldset>
          <label>Dons, conhecimentos ou recursos que deseja oferecer
            <textarea name="contribuicao" rows="3" maxlength="800" placeholder="Conte-nos brevemente como gostaria de contribuir."></textarea>
          </label>
          <label>Mensagem, pergunta ou testemunho
            <textarea name="mensagem" rows="4" maxlength="1200"></textarea>
          </label>
          <label class="consent">
            <input name="consentimento" type="checkbox" required />
            <span>Autorizo o uso destes dados somente para contato e atividades do Projeto Milênio — RISSET DIVINO. Posso solicitar correção ou exclusão.</span>
          </label>
          <input class="honeypot" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" />
          <button class="participate form-submit" type="submit">ENVIAR MINHA RESPOSTA</button>
          <p class="form-status" id="formStatus" role="status" aria-live="polite"></p>
        </form>
      </section>
    </main>
    <footer><p>Projeto Milênio — RISSET DIVINO</p><p>A Família de Deus Ativa em Movimento — Brasil, 2026</p></footer>
  </body>
</html>`;
}
