import { chromium } from "playwright";
import assert from "node:assert/strict";
const base = process.env.SMOKE_URL || "http://localhost:3001";
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : {}),
  args: process.env.CHROMIUM_NO_SANDBOX === "true" ? ["--no-sandbox"] : [],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + "/admin");
  await page
    .getByRole("button", { name: "Explorar demonstração local" })
    .click();
  await page
    .getByRole("heading", { name: "Visão geral", exact: true })
    .waitFor();
  await page.screenshot({ path: "/tmp/risset-dashboard.png", fullPage: true });
  await page.getByRole("button", { name: "Nova página", exact: false }).click();
  await page.getByLabel("Título", { exact: true }).fill("Estudo de validação");
  await page
    .getByLabel("Conteúdo (texto / Markdown)")
    .fill("## Formação\n\nUm estudo para validação.");
  await page
    .getByRole("button", { name: "Salvar conteúdo", exact: true })
    .click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert(
    await page.getByText("Estudo de validação", { exact: true }).isVisible(),
  );
  const row = () =>
    page.getByRole("row").filter({ hasText: "Estudo de validação" });
  await row().getByRole("button", { name: "Abrir", exact: true }).click();
  await page.getByLabel("Status", { exact: true }).selectOption("publicado");
  await page.getByLabel("Acesso", { exact: true }).selectOption("publico");
  await page
    .getByRole("button", { name: "Salvar conteúdo", exact: true })
    .click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert(await row().getByText("publicado", { exact: true }).isVisible());
  await page.reload();
  await page
    .getByRole("button", { name: "Explorar demonstração local" })
    .click();
  await page
    .getByRole("button", { name: "Páginas", exact: false })
    .first()
    .click();
  assert(
    await page.getByText("Estudo de validação", { exact: true }).isVisible(),
  );
  await row().getByRole("button", { name: "Abrir", exact: true }).click();
  await page
    .getByRole("button", { name: "Pré-visualizar", exact: true })
    .click();
  await page.getByRole("heading", { name: "Formação", exact: true }).waitFor();
  await page.getByRole("button", { name: "Fechar pré-visualização" }).click();
  await page.getByRole("button", { name: "Mover para lixeira" }).click();
  await page
    .getByRole("button", { name: "Salvar conteúdo", exact: true })
    .click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert(await row().getByText("lixeira", { exact: true }).isVisible());
  await row().getByRole("button", { name: "Abrir", exact: true }).click();
  await page.getByRole("button", { name: "Restaurar rascunho" }).click();
  await page
    .getByRole("button", { name: "Salvar conteúdo", exact: true })
    .click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  await page
    .getByRole("button", { name: "Configurações", exact: false })
    .click();
  await page
    .getByLabel("WhatsApp oficial (código do país + número)")
    .fill("5511999999999");
  await page.getByRole("button", { name: "Publicar configurações" }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Configurações publicadas" })
    .waitFor();
  await page.getByLabel("Busca global").fill("Estudo de validação");
  assert(
    await page.getByText("Estudo de validação", { exact: true }).isVisible(),
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS demo: criação, publicação, persistência, Markdown, lixeira, restauração, configurações e busca",
  );
  await page.setViewportSize({ width: 360, height: 800 });
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.getByRole("button", { name: "Visão geral", exact: false }).click();
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.screenshot({
    path: "/tmp/risset-admin-mobile.png",
    fullPage: true,
  });
  console.log("PASS dashboard móvel sem overflow");
  await page.goto(base + "/");
  assert.equal(
    await page.getByRole("heading", { level: 1 }).innerText(),
    "A Família de Deus Ativa em Movimento",
  );
  await page.getByText("Menu", { exact: true }).click();
  await page.getByRole("link", { name: "Contato", exact: true }).click();
  console.log("PASS Home preservada e navegação móvel");
} finally {
  await browser.close();
}
