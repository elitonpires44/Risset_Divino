import { site } from "../src/content/site.js";
export const settingsSeed = {
  key: "site",
  value: {
    content: site,
    whatsapp: "",
    email: "",
    site_url: "",
    privacy: "",
    analytics_enabled: false,
  },
};
export function seedRecords() {
  const images = [
    site.hero.image,
    ...site.visuals.map((v) => v.image),
    site.book.image,
    site.movement.image,
  ];
  return [
    ...images.map((image, i) => ({
      id: `seed-art-${i}`,
      module: "artworks",
      title: image.alt,
      slug: `arte-${i + 1}`,
      description: image.alt,
      body: "",
      category: "Identidade institucional",
      tags: [],
      language: "pt-BR",
      status: "rascunho",
      visibility: "publico",
      sort_order: i,
      metadata: {
        code: `RD-${String(i + 1).padStart(3, "0")}`,
        alt: image.alt,
        version: "1",
        author: "Projeto Milênio - RISSET DIVINO",
        original_url: image.src.replace("./", "/"),
        web_url: image.src.replace("./", "/").replace(".png", ".webp"),
      },
      publish_at: null,
    })),
    ...["GPS Divino", "Formação"].map((title, i) => ({
      id: `seed-page-${i}`,
      module: "pages",
      title,
      slug: i ? "formacao" : "gps-divino",
      description: "",
      body: "",
      category: "Institucional",
      tags: [],
      language: "pt-BR",
      status: "rascunho",
      visibility: "publico",
      metadata: {},
      sort_order: i,
      publish_at: null,
    })),
  ];
}
