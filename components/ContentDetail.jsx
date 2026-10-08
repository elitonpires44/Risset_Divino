import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PublicShell from "./PublicShell";
import { safeUrl } from "../lib/modules";
export default function ContentDetail({ record }) {
  let schema;
  try {
    schema = record.metadata?.schema_json
      ? JSON.parse(record.metadata.schema_json)
      : {
          "@context": "https://schema.org",
          "@type": record.module === "artworks" ? "CreativeWork" : "Article",
          name: record.title,
          description: record.description,
          inLanguage: record.language,
        };
  } catch {
    schema = null;
  }
  return (
    <PublicShell
      title={record.title}
      kicker={record.category || "RISSET DIVINO"}
    >
      <article>
        {schema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
            }}
          />
        )}
        <p>{record.description}</p>
        {record.fileUrl && record.module === "artworks" ? (
          <img
            src={record.fileUrl}
            alt={record.metadata?.alt || record.title}
          />
        ) : null}
        <div className="body-copy">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {record.body}
          </ReactMarkdown>
        </div>
        {record.metadata?.spiritual_reading && (
          <section>
            <h2>Leitura espiritual</h2>
            <p className="body-copy">{record.metadata.spiritual_reading}</p>
          </section>
        )}
        {record.metadata?.biblical_reference && (
          <blockquote>{record.metadata.biblical_reference}</blockquote>
        )}
        <p>{record.metadata?.author}</p>
        {record.metadata?.rights && <small>{record.metadata.rights}</small>}
        {record.fileUrl &&
          (record.metadata?.allow_download || record.module !== "artworks") && (
            <p>
              <a
                className="public-button"
                href={record.fileUrl}
                target="_blank"
                rel="noopener"
              >
                Abrir material
              </a>
            </p>
          )}
        {record.metadata?.related_slug &&
          /^[a-z0-9-]+$/.test(record.metadata.related_slug) && (
            <p>
              <a href={`/conteudos/${record.metadata.related_slug}`}>
                Conteúdo relacionado
              </a>
            </p>
          )}
      </article>
    </PublicShell>
  );
}
