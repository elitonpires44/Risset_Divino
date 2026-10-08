import test from "node:test";
import assert from "node:assert/strict";
import { can, isPublic, slugify, safeUrl } from "../lib/modules.js";
import { renderPage } from "../src/render.js";
import { site } from "../src/content/site.js";
test("rascunhos, materiais internos e agendados não são públicos", () => {
  const base = { status: "publicado", visibility: "publico" };
  assert(isPublic(base));
  assert(!isPublic({ ...base, status: "revisao" }));
  assert(!isPublic({ ...base, visibility: "interno" }));
  assert(!isPublic({ ...base, publish_at: "2030-01-01T00:00:00Z" }, 0));
  assert(isPublic({ ...base, publish_at: "2020-01-01T00:00:00Z" }));
});
test("editor e colaborador não publicam; configurações são exclusivas do Super Admin", () => {
  assert(can("super_admin", "settings"));
  for (const role of ["gestor", "editor", "revisor", "colaborador", "membro"])
    assert(!can(role, "settings"));
  assert(can("editor", "write"));
  assert(!can("editor", "publish"));
  assert(!can("colaborador", "publish"));
  assert(can("revisor", "publish"));
  assert(!can("membro", "read"));
});
test("slugs e links excluem protocolos executáveis", () => {
  assert.equal(slugify("Formação & Propósito"), "formacao-proposito");
  assert.equal(safeUrl("javascript:alert(1)"), "");
  assert.equal(safeUrl("//attacker.test"), "");
  assert.equal(safeUrl("/assets/logo.png"), "/assets/logo.png");
});
test("conteúdo editável é escapado e não vaza entre requisições", () => {
  const copy = structuredClone(site);
  copy.hero.title = "<script>alert(1)</script>";
  copy.hero.image.src = "javascript:alert(1)";
  const html = renderPage({ content: copy });
  assert(!html.includes("<script>alert(1)</script>"));
  assert(html.includes("&lt;script&gt;"));
  assert(!html.includes('src="javascript:'));
  assert(renderPage().includes(site.hero.title));
});
test("contatos opcionais e validação de domínio oficial", () => {
  assert(!renderPage().includes("wa.me/"));
  assert(
    renderPage({ whatsappNumber: "5511999999999" }).includes(
      "wa.me/5511999999999",
    ),
  );
  assert.throws(() => renderPage({ siteUrl: "http://invalid.test" }));
  assert.throws(() => renderPage({ whatsappNumber: "abc" }));
});
test("navegação preservada sem IDs duplicados ou âncoras inválidas", () => {
  const html = renderPage();
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(ids.length, new Set(ids).size);
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g))
    assert(ids.includes(id));
});
