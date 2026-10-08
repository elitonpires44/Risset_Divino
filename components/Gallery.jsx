"use client";
import { useState } from "react";
export default function Gallery({ records, art = false }) {
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState("");
  const filtered = records.filter(
    (r) =>
      (!category || r.category === category) &&
      JSON.stringify([
        r.title,
        r.description,
        r.category,
        r.metadata?.biblical_reference,
        r.tags,
      ])
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="public-filters">
        <input
          aria-label="Buscar conteúdos"
          placeholder="Buscar por título, referência ou tema"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Categoria"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {[...new Set(records.map((r) => r.category).filter(Boolean))].map(
            (c) => (
              <option key={c}>{c}</option>
            ),
          )}
        </select>
      </div>
      {filtered.length ? (
        <div className="public-grid">
          {filtered.map((r) => (
            <a
              className="public-card"
              href={`/${art ? "galeria" : "conteudos"}/${r.slug}`}
              key={r.id}
            >
              {r.fileUrl && art ? (
                <img
                  src={r.fileUrl}
                  alt={r.metadata?.alt || r.title}
                  loading="lazy"
                />
              ) : null}
              <div>
                <small>
                  {r.category} · {r.language}
                </small>
                <h2>{r.title}</h2>
                <p>{r.description}</p>
                <span>Conhecer o conteúdo ↗</span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p>
          Os conteúdos desta área serão apresentados após a revisão e
          publicação.
        </p>
      )}
    </>
  );
}
