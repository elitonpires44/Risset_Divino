import { renderPage } from "../src/render";
import { siteSettings, publicRecords } from "../lib/public";
export const dynamic = "force-dynamic";
export default async function Home() {
  const settings = await siteSettings();
  const html = renderPage({
    content: settings?.content,
    siteUrl: settings?.site_url || process.env.SITE_URL,
    contactEmail: settings?.email || undefined,
    whatsappNumber: settings?.whatsapp || undefined,
  });
  const body = html.match(/<body>([\s\S]*)<\/body>/)[1];
  const records = await publicRecords("pages");
  return (
    <>
      <link rel="stylesheet" href="/styles.css" />
      <script src="/app.js" defer />
      <div dangerouslySetInnerHTML={{ __html: body }} />
      <section
        style={{ padding: "32px", background: "#07172c", color: "#fff4c4" }}
      >
        <nav aria-label="Conteúdos da plataforma">
          <a href="/galeria">Galeria de artes</a> ·{" "}
          <a href="/conteudos">Estudos e acervo</a> ·{" "}
          <a href="/contato">Contato e participação</a>
          {records.map((r) => (
            <a
              key={r.id}
              href={`/conteudos/${r.slug}`}
              style={{ marginLeft: 16 }}
            >
              {r.title}
            </a>
          ))}
        </nav>
      </section>
    </>
  );
}
export async function generateMetadata() {
  const settings = await siteSettings();
  const content = settings?.content;
  return {
    title: content?.displayTitle || "Projeto Milênio - RISSET DIVINO",
    description: content?.description || "A Família de Deus Ativa em Movimento",
    ...(settings?.site_url
      ? {
          metadataBase: new URL(settings.site_url),
          alternates: { canonical: "/" },
          openGraph: { images: ["/assets/hero-risset-divino.png"] },
        }
      : {}),
  };
}
