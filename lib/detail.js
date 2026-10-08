import { publicRecords } from "./public";
import { safeUrl } from "./modules";
export async function detail(slug, art = false) {
  const list = await publicRecords(art ? "artworks" : undefined);
  return list.find((r) => r.slug === slug && (art || r.module !== "artworks"));
}
export async function detailMetadata(slug, art = false) {
  const r = await detail(slug, art);
  if (!r) return { title: "Conteúdo não encontrado" };
  return {
    title: r.metadata?.seo_title || `${r.title} | RISSET DIVINO`,
    description: r.metadata?.seo_description || r.description,
    alternates:
      r.metadata?.canonical && safeUrl(r.metadata.canonical)
        ? { canonical: r.metadata.canonical }
        : undefined,
    openGraph:
      r.metadata?.og_image && safeUrl(r.metadata.og_image)
        ? { images: [r.metadata.og_image] }
        : undefined,
  };
}
