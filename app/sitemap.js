import { publicRecords, siteSettings } from "../lib/public";
export const dynamic = "force-dynamic";
export default async function sitemap() {
  const settings = await siteSettings();
  const url = settings?.site_url || process.env.SITE_URL;
  if (!url) return [];
  const records = await publicRecords();
  return [
    "",
    "galeria",
    "conteudos",
    "contato",
    ...records
      .filter((r) => !["tasks", "forms", "seo"].includes(r.module))
      .map(
        (r) => `${r.module === "artworks" ? "galeria" : "conteudos"}/${r.slug}`,
      ),
  ].map((path) => ({ url: new URL("/" + path, url).href }));
}
