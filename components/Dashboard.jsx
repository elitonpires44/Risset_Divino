"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useMemo, useState } from "react";
import { makeClient, configured } from "../lib/supabase";
import { repository } from "../lib/repository";
import {
  modules,
  contentModules,
  roles,
  labels,
  statuses,
  can,
  slugify,
  artworkFields,
} from "../lib/modules";
import { seedRecords, settingsSeed } from "../lib/seed";
import "./dashboard.css";
const empty = {
  records: [],
  contacts: [],
  profiles: [],
  logs: [],
  backups: [],
  versions: [],
  settings: settingsSeed.value,
};
const demoAllowed =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_DEMO_MODE === "true";
function newRecord(module) {
  return {
    module,
    title: "",
    slug: "",
    description: "",
    body: "",
    category: "",
    tags: [],
    language: "pt-BR",
    status: "rascunho",
    visibility: "interno",
    metadata: {},
    sort_order: 0,
    publish_at: null,
  };
}
function download(name, data, type = "application/json") {
  const url = URL.createObjectURL(
    new Blob(
      [typeof data === "string" ? data : JSON.stringify(data, null, 2)],
      { type },
    ),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  large = false,
}) {
  return (
    <label className={large ? "span-full" : ""}>
      {label}
      {large ? (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
        />
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
      )}
    </label>
  );
}
export default function Dashboard() {
  const db = useMemo(() => makeClient(), []);
  const [user, setUser] = useState(null),
    [role, setRole] = useState(null),
    [demo, setDemo] = useState(false),
    [loading, setLoading] = useState(true);
  const [data, setData] = useState(empty),
    [section, setSection] = useState("overview"),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState(""),
    [editor, setEditor] = useState(null),
    [preview, setPreview] = useState(null),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [menu, setMenu] = useState(false);
  const repo = useMemo(() => repository(db, demo), [db, demo]);
  async function refresh() {
    const next = await repo.load();
    setData(next);
    return next;
  }
  async function perform(fn, success = "Alteração salva.") {
    setBusy(true);
    setMessage("");
    try {
      await fn();
      await refresh();
      setMessage(success);
    } catch (e) {
      setMessage(`Não foi possível concluir: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    let active = true;
    async function authenticate(session) {
      if (!active) return;
      setUser(session?.user || null);
      setRole(null);
      if (session?.user) {
        const result = await db
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        if (!active) return;
        if (result.error)
          setMessage("Não foi possível verificar sua permissão.");
        else setRole(result.data.role);
      }
      setLoading(false);
    }
    db.auth.getSession().then(({ data }) => authenticate(data.session));
    const { data: subscription } = db.auth.onAuthStateChange((_, session) => {
      setTimeout(() => authenticate(session), 0);
    });
    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [db]);
  useEffect(() => {
    if ((user && role && can(role, "read")) || demo)
      refresh().catch((e) => setMessage(e.message));
  }, [user, role, demo]);
  async function login(e) {
    e.preventDefault();
    if (!db) return;
    setBusy(true);
    const result = await db.auth.signInWithPassword({ email, password });
    setPassword("");
    setBusy(false);
    if (result.error)
      setMessage("Não foi possível entrar. Confira seu e-mail e senha.");
  }
  async function reset() {
    if (!db || !email) {
      setMessage("Informe seu e-mail para recuperar o acesso.");
      return;
    }
    const result = await db.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/recuperar-senha`,
    });
    setMessage(
      result.error
        ? "Não foi possível enviar a recuperação."
        : "Se houver uma conta, você receberá as instruções por e-mail.",
    );
  }

  useEffect(() => {
    if (!editor && !preview) return;
    const previous = document.activeElement;
    const dialogs = document.querySelectorAll('[role="dialog"]');
    const dialog = dialogs[dialogs.length - 1];
    if (!dialog) return;
    const focusable = () =>
      Array.from(
        dialog.querySelectorAll(
          "button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],summary",
        ),
      ).filter((el) => el.getClientRects().length);
    focusable()[0]?.focus();
    function keyboard(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (preview) setPreview(null);
        else setEditor(null);
      }
      if (event.key === "Tab") {
        const list = focusable();
        if (!list.length) return;
        const first = list[0],
          last = list.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", keyboard);
    return () => {
      document.removeEventListener("keydown", keyboard);
      if (previous?.isConnected) previous.focus();
    };
  }, [!!editor, !!preview]);

  if (loading)
    return (
      <main className="admin-app login-shell">
        <p>Verificando sessão…</p>
      </main>
    );
  if (!user && !demo)
    return (
      <main className="admin-app login-shell">
        <div className="login-art">
          <div className="brand-seal">RD</div>
          <p className="eyebrow">PROJETO MILÊNIO</p>
          <h1>RISSET DIVINO</h1>
          <p>A Família de Deus Ativa em Movimento</p>
          <span>
            Conteúdo com propósito.
            <br />
            Gestão com responsabilidade.
          </span>
        </div>
        <section className="login-panel">
          <p className="eyebrow">CENTRO DE GESTÃO</p>
          <h2>Bem-vindo à plataforma.</h2>
          <p>Entre para organizar, cuidar e publicar.</p>
          {configured() ? (
            <form onSubmit={login}>
              <Field
                label="E-mail"
                type="email"
                value={email}
                onChange={setEmail}
                required
              />
              <Field
                label="Senha"
                type="password"
                value={password}
                onChange={setPassword}
                required
              />
              <button disabled={busy} className="primary">
                Entrar com segurança
              </button>
              <button type="button" className="text-button" onClick={reset}>
                Esqueci minha senha
              </button>
            </form>
          ) : (
            <div className="notice">
              <strong>Conexão da plataforma pendente</strong>
              <p>
                O acesso administrativo será liberado após configurar o
                Supabase. Nenhum login ou senha de demonstração é usado na
                plataforma real.
              </p>
            </div>
          )}
          {demoAllowed && (
            <button
              className="secondary"
              onClick={() => {
                setDemo(true);
                setRole("super_admin");
              }}
            >
              Explorar demonstração local
            </button>
          )}
          <p role="status">{message}</p>
          <a href="/">Voltar ao site público ↗</a>
        </section>
      </main>
    );
  if (!demo && !can(role, "read"))
    return (
      <main className="admin-app login-shell">
        <section className="login-panel">
          <h1>Acesso administrativo restrito</h1>
          <p>
            Sua conta não possui permissão para o painel. Solicite acesso ao
            Super Admin.
          </p>
          <button onClick={() => db.auth.signOut()}>Sair</button>
          <a href="/">Voltar ao site</a>
        </section>
      </main>
    );
  const title = modules.find((m) => m.id === section)?.label || "Visão geral";
  const records = data.records.filter(
    (r) =>
      (search
        ? JSON.stringify(r).toLowerCase().includes(search.toLowerCase())
        : r.module === section) &&
      (!filter || r.status === filter),
  );
  const count = (status) =>
    data.records.filter((r) => r.status === status).length;
  async function saveRecord(e) {
    e.preventDefault();
    if (editor.metadata?.schema_json) {
      try {
        JSON.parse(editor.metadata.schema_json);
      } catch {
        setMessage(
          "Schema JSON-LD inválido. Confira a sintaxe antes de salvar.",
        );
        return;
      }
    }
    const record = { ...editor, slug: editor.slug || slugify(editor.title) };
    await perform(async () => {
      await repo.save(record);
      setEditor(null);
    }, "Conteúdo salvo. A visibilidade depende do status, acesso e agendamento.");
  }
  async function importSeed() {
    await perform(async () => {
      for (const record of seedRecords()) {
        if (
          data.records.some(
            (r) => r.slug === record.slug && r.module === record.module,
          )
        )
          continue;
        const { id, ...payload } = record;
        await repo.save(payload);
      }
    }, "Artes e páginas iniciais importadas como rascunhos.");
  }
  async function bulkUpload(files) {
    setBusy(true);
    let ok = 0;
    const failures = [];
    for (const file of files) {
      try {
        await repo.upload(file, section, filter || "");
        ok++;
      } catch (e) {
        failures.push(`${file.name}: ${e.message}`);
      }
    }
    try {
      await refresh();
    } catch (e) {
      failures.push(e.message);
    }
    setMessage(
      `${ok} arquivo(s) cadastrado(s) em rascunho. ${failures.join(" ")}`,
    );
    setBusy(false);
  }
  return (
    <div className="admin-app dashboard-shell">
      <aside className={menu ? "sidebar mobile-open" : "sidebar"}>
        <a className="admin-brand" href="/">
          <span className="brand-seal small">RD</span>
          <div>
            RISSET DIVINO<small>PROJETO MILÊNIO</small>
          </div>
        </a>
        <span className="sidebar-caption">CENTRO DE GESTÃO</span>
        <nav aria-label="Administração">
          <button
            className={section === "overview" ? "active" : ""}
            onClick={() => {
              setSection("overview");
              setSearch("");
              setMenu(false);
            }}
          >
            ◉ <span>Visão geral</span>
          </button>
          {modules.map((m) => (
            <button
              key={m.id}
              className={section === m.id ? "active" : ""}
              onClick={() => {
                setSection(m.id);
                setSearch("");
                setFilter("");
                setMenu(false);
              }}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          O MELHOR SEMPRE<small>O melhor é que somos de Deus.</small>
        </div>
      </aside>
      <div className="dashboard-main">
        <header className="admin-topbar">
          <button
            className="mobile-menu secondary"
            onClick={() => setMenu(!menu)}
            aria-expanded={menu}
          >
            Menu
          </button>
          <div className="search-box">
            <span>⌕</span>
            <input
              aria-label="Busca global"
              placeholder="Buscar conteúdos, códigos, referências…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <a href="/" target="_blank" rel="noopener">
            Ver site ↗
          </a>
          <button
            className="avatar"
            onClick={() => {
              if (demo) {
                setDemo(false);
                setData(empty);
              } else db.auth.signOut();
            }}
            title="Sair da sessão"
          >
            {demo ? "D" : (user?.email || "A")[0].toUpperCase()}
          </button>
        </header>
        {demo && (
          <div className="demo-banner">
            Demonstração local · dados neste navegador · sem conexão com a
            plataforma real.
          </div>
        )}
        <main className="admin-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">A FAMÍLIA DE DEUS ATIVA EM MOVIMENTO</p>
              <h1>{search ? "Resultados da busca" : title}</h1>
              <p>
                {section === "overview"
                  ? "Uma visão clara para cuidar de cada parte do projeto."
                  : "Organize, revise e publique com responsabilidade."}
              </p>
            </div>
            <span className="role-chip">{labels[role]}</span>
          </div>
          <div role="status" className={message ? "notice status-message" : ""}>
            {message}
          </div>
          {section === "overview" && !search ? (
            <>
              <div className="stat-grid">
                {[
                  ["Conteúdos", data.records.length, "Toda a plataforma"],
                  ["Publicados", count("publicado"), "Mensagem em movimento"],
                  ["Em revisão", count("revisao"), "Cuidado antes de publicar"],
                  [
                    "Contatos novos",
                    data.contacts.filter((c) => c.status === "novo").length,
                    "Pessoas para acolher",
                  ],
                ].map(([label, value, note]) => (
                  <article className="stat-card" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                    <small>{note}</small>
                  </article>
                ))}
              </div>
              <div className="overview-columns">
                <section className="panel">
                  <div className="panel-heading">
                    <h2>Continue construindo.</h2>
                    <span>PRÓXIMAS AÇÕES</span>
                  </div>
                  <div className="quick-actions">
                    {[
                      ["pages", "Nova página", "▤"],
                      ["artworks", "Nova arte", "◈"],
                      ["posts", "Novo estudo", "✎"],
                      ["archive", "Organizar acervo", "▥"],
                    ].map(([id, label, icon]) => (
                      <button
                        key={id}
                        disabled={!can(role, "write")}
                        onClick={() => {
                          setSection(id);
                          setEditor(newRecord(id));
                        }}
                      >
                        <span>{icon}</span>
                        <strong>{label}</strong>
                        <small>Dar espaço ao propósito ↗</small>
                      </button>
                    ))}
                  </div>
                </section>
                <section className="panel">
                  <p className="eyebrow">ORGANIZAÇÃO E CUIDADO</p>
                  <h2>Seu acervo merece contexto.</h2>
                  <p>
                    Identifique cada arte, preserve sua referência e revise
                    antes de publicar.
                  </p>
                  <button
                    className="secondary"
                    disabled={busy || !can(role, "write")}
                    onClick={importSeed}
                  >
                    Importar as artes do site atual
                  </button>
                  <p className="subtle">
                    A importação preserva os originais e cria rascunhos para
                    revisão.
                  </p>
                </section>
              </div>
              <section className="panel">
                <div className="panel-heading">
                  <h2>Conteúdos recentes</h2>
                  <span>{data.records.length} REGISTROS CARREGADOS</span>
                </div>
                <RecordTable
                  records={data.records.slice(-6).reverse()}
                  edit={setEditor}
                  preview={setPreview}
                />
              </section>
            </>
          ) : section === "settings" && !search ? (
            <Settings
              value={data.settings}
              disabled={!can(role, "settings") || busy}
              save={(value) =>
                perform(
                  () => repo.settings(value),
                  "Configurações publicadas no site.",
                )
              }
            />
          ) : section === "permissions" && !search ? (
            <section className="panel">
              <h2>Governança por função</h2>
              <p>
                As permissões são aplicadas por políticas no banco, além do
                painel.
              </p>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Função</th>
                      {[
                        "read",
                        "write",
                        "publish",
                        "settings",
                        "users",
                        "backup",
                      ].map((a) => (
                        <th key={a}>
                          {
                            {
                              read: "Visualizar",
                              write: "Criar/editar",
                              publish: "Aprovar/publicar",
                              settings: "Configurar",
                              users: "Usuários",
                              backup: "Backup",
                            }[a]
                          }
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((r) => (
                      <tr key={r}>
                        <td>{labels[r]}</td>
                        {[
                          "read",
                          "write",
                          "publish",
                          "settings",
                          "users",
                          "backup",
                        ].map((a) => (
                          <td key={a}>{can(r, a) ? "Permitido" : "—"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                Colaboradores editam apenas seus rascunhos. Editores não alteram
                conteúdos aprovados. Gestores e revisores conduzem revisão e
                publicação.
              </p>
            </section>
          ) : section === "users" && !search ? (
            <section className="panel">
              <h2>Usuários e responsabilidades</h2>
              <p>
                Cadastre ou convide usuários no Supabase Auth. Aqui o Super
                Admin define a função das contas existentes.
              </p>
              {data.profiles.map((p) => (
                <div className="user-row" key={p.id}>
                  <div>
                    <strong>{p.display_name || "Conta sem nome"}</strong>
                    <small>{p.id}</small>
                  </div>
                  <select
                    aria-label={`Função de ${p.display_name || p.id}`}
                    value={p.role}
                    disabled={!can(role, "users") || busy}
                    onChange={(e) =>
                      perform(() => repo.role(p.id, e.target.value))
                    }
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {labels[r]}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </section>
          ) : section === "contacts" && !search ? (
            <section className="panel">
              <div className="panel-heading">
                <h2>Relacionamentos</h2>
                <button
                  disabled={!["super_admin", "gestor"].includes(role)}
                  onClick={() => {
                    const cell = (v) =>
                      '"' +
                      String(v ?? "")
                        .replace(/^[=+@-]/, "'")
                        .replaceAll('"', '""') +
                      '"';
                    download(
                      "contatos.csv",
                      [
                        "Nome,E-mail,Telefone,Cidade,Estado,Interesse,Status",
                        ...data.contacts.map((c) =>
                          [
                            c.name,
                            c.email,
                            c.phone,
                            c.city,
                            c.state,
                            c.interest,
                            c.status,
                          ]
                            .map(cell)
                            .join(","),
                        ),
                      ].join("\n"),
                      "text/csv;charset=utf-8",
                    );
                  }}
                >
                  Exportar CSV
                </button>
              </div>
              {!["super_admin", "gestor"].includes(role) ? (
                <p>Contatos pessoais são restritos ao Super Admin e Gestor.</p>
              ) : data.contacts.length ? (
                data.contacts.map((c) => (
                  <Contact
                    key={c.id}
                    value={c}
                    save={(record) => perform(() => repo.contact(record))}
                  />
                ))
              ) : (
                <Empty text="Os contatos recebidos pelo formulário aparecerão aqui." />
              )}
            </section>
          ) : section === "logs" && !search ? (
            <section className="panel">
              <h2>Histórico de ações</h2>
              {data.logs.length ? (
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Ação</th>
                        <th>Área</th>
                        <th>Responsável</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.logs.map((log) => (
                        <tr key={log.id}>
                          <td>
                            {new Date(log.created_at).toLocaleString("pt-BR")}
                          </td>
                          <td>{log.action}</td>
                          <td>{log.entity}</td>
                          <td>{log.actor || "Demonstração"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty text="Nenhuma ação registrada para sua permissão." />
              )}
            </section>
          ) : section === "backups" && !search ? (
            <section className="panel">
              <h2>Preservação da plataforma</h2>
              <p>
                Crie uma cópia dos cadastros, configurações, contatos e versões.
                Os arquivos de mídia e usuários Auth precisam do backup próprio
                do Supabase.
              </p>
              <button
                className="primary"
                disabled={!can(role, "backup") || busy}
                onClick={() =>
                  perform(
                    async () =>
                      download(
                        `risset-backup-${new Date().toISOString().slice(0, 10)}.json`,
                        await repo.backup(),
                      ),
                    "Backup de dados criado e exportado. Guarde em local seguro.",
                  )
                }
              >
                Criar e exportar backup de dados
              </button>
              <p className="subtle">
                A restauração recupera os cadastros do snapshot, configurações e
                contatos. Não apaga registros posteriores nem altera contas,
                papéis ou arquivos.
              </p>
              {data.backups.map((b) => (
                <p key={b.id}>
                  {new Date(b.created_at).toLocaleString("pt-BR")} · {b.id}{" "}
                  <button
                    disabled={!can(role, "backup") || busy}
                    onClick={() => {
                      if (
                        window.confirm(
                          "Restaurar conteúdo, configurações e contatos desta cópia? Os valores atuais desses cadastros serão substituídos.",
                        )
                      )
                        perform(
                          () => repo.restoreBackup(b.id),
                          "Cadastros restaurados; histórico preservado.",
                        );
                    }}
                  >
                    Restaurar cadastros
                  </button>
                </p>
              ))}
            </section>
          ) : (
            <section className="panel">
              <div className="toolbar">
                <div className="filters">
                  <select
                    aria-label="Filtrar status"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="">Todos os status</option>
                    {statuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <span>{records.length} itens</span>
                </div>
                <div className="actions">
                  <button
                    className="primary"
                    disabled={!can(role, "write")}
                    onClick={() =>
                      setEditor(
                        newRecord(
                          contentModules.some((m) => m.id === section)
                            ? section
                            : "pages",
                        ),
                      )
                    }
                  >
                    + Novo conteúdo
                  </button>
                  {["artworks", "archive", "media", "rissetv"].includes(
                    section,
                  ) && (
                    <label className="upload-button">
                      Enviar arquivos
                      <input
                        type="file"
                        multiple
                        accept="image/png,image/jpeg,image/webp,application/pdf,audio/mpeg,audio/wav,video/mp4,.docx,.pptx"
                        disabled={busy || !can(role, "write") || demo}
                        onChange={(e) => {
                          bulkUpload(Array.from(e.target.files));
                          e.target.value = "";
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
              <RecordTable
                records={records}
                edit={setEditor}
                preview={setPreview}
              />
              {data.records.length >= 1000 && (
                <p>
                  Limite de 1.000 registros carregados. Use a consulta no banco
                  para acervos maiores.
                </p>
              )}
            </section>
          )}
          {search && ["super_admin", "gestor"].includes(role) && (
            <section className="panel">
              <h2>Contatos encontrados</h2>
              {data.contacts
                .filter((c) =>
                  JSON.stringify(c)
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((c) => (
                  <Contact
                    key={c.id}
                    value={c}
                    save={(record) => perform(() => repo.contact(record))}
                  />
                ))}
            </section>
          )}
        </main>
        <footer className="admin-footer">
          Projeto Milênio - RISSET DIVINO{" "}
          <span>Propósito · Padrão · Ordem · Serviço</span>
        </footer>
      </div>
      {editor && (
        <div className="modal-backdrop">
          <section
            className="editor-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="editor-title"
          >
            <header>
              <div>
                <p className="eyebrow">
                  {modules.find((m) => m.id === editor.module)?.label}
                </p>
                <h2 id="editor-title">
                  {editor.id ? "Editar conteúdo" : "Novo conteúdo"}
                </h2>
              </div>
              <button
                aria-label="Fechar editor"
                onClick={() => setEditor(null)}
              >
                ✕
              </button>
            </header>
            <form onSubmit={saveRecord}>
              <div className="form-grid">
                <Field
                  label="Título"
                  value={editor.title}
                  required
                  onChange={(v) =>
                    setEditor({
                      ...editor,
                      title: v,
                      slug: editor.id ? editor.slug : slugify(v),
                    })
                  }
                />
                <Field
                  label="Slug"
                  value={editor.slug}
                  onChange={(v) => setEditor({ ...editor, slug: slugify(v) })}
                />
                <Field
                  label="Resumo"
                  large
                  value={editor.description}
                  onChange={(v) => setEditor({ ...editor, description: v })}
                />
                <div className="span-full editor-formatting">
                  <span>Inserir no conteúdo: </span>
                  {[
                    ["Título", "\n## Título\n"],
                    ["Negrito", "**Texto em destaque**"],
                    ["Citação", "\n> Referência ou citação\n"],
                    ["Link", "[Texto do link](https://)"],
                    ["Imagem", "![Texto alternativo](https://)"],
                    [
                      "Tabela",
                      "\n| Coluna | Coluna |\n| --- | --- |\n| Texto | Texto |\n",
                    ],
                  ].map(([label, text]) => (
                    <button
                      type="button"
                      key={label}
                      onClick={() =>
                        setEditor({ ...editor, body: editor.body + text })
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <Field
                  label="Conteúdo (texto / Markdown)"
                  large
                  value={editor.body}
                  onChange={(v) => setEditor({ ...editor, body: v })}
                />
                <Field
                  label="Categoria"
                  value={editor.category}
                  onChange={(v) => setEditor({ ...editor, category: v })}
                />
                <Field
                  label="Tags, separadas por vírgula"
                  value={editor.tags.join(", ")}
                  onChange={(v) =>
                    setEditor({
                      ...editor,
                      tags: v
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                />
                <label>
                  Idioma
                  <select
                    aria-label="Idioma"
                    value={editor.language}
                    onChange={(e) =>
                      setEditor({ ...editor, language: e.target.value })
                    }
                  >
                    {["pt-BR", "en", "es", "de", "he"].map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Status
                  <select
                    aria-label="Status"
                    value={editor.status}
                    onChange={(e) =>
                      setEditor({ ...editor, status: e.target.value })
                    }
                  >
                    {statuses
                      .filter(
                        (s) =>
                          can(role, "publish") ||
                          ["rascunho", "revisao"].includes(s) ||
                          s === editor.status,
                      )
                      .map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                  </select>
                </label>
                <label>
                  Acesso
                  <select
                    aria-label="Acesso"
                    value={editor.visibility}
                    onChange={(e) =>
                      setEditor({ ...editor, visibility: e.target.value })
                    }
                  >
                    {[
                      "publico",
                      "restrito",
                      "interno",
                      "equipe",
                      ...(role === "super_admin" ? ["super_admin"] : []),
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <Field
                  label="Ordem"
                  type="number"
                  value={editor.sort_order}
                  onChange={(v) =>
                    setEditor({ ...editor, sort_order: Number(v) })
                  }
                />
                <Field
                  label="Agendar publicação"
                  type="datetime-local"
                  value={
                    editor.publish_at
                      ? new Date(
                          new Date(editor.publish_at) -
                            new Date(editor.publish_at).getTimezoneOffset() *
                              60000,
                        )
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(v) =>
                    setEditor({
                      ...editor,
                      publish_at: v ? new Date(v).toISOString() : null,
                    })
                  }
                />
                {(editor.module === "artworks"
                  ? artworkFields
                  : [
                      ["code", "Código"],
                      ["version", "Versão"],
                      ["author", "Autoria"],
                      ["rights", "Direitos"],
                      ["biblical_reference", "Referência bíblica"],
                      ["collection", "Coleção"],
                      ["recommended_use", "Uso recomendado"],
                    ]
                )
                  .concat([
                    ["original_url", "Arquivo original (URL HTTPS ou local)"],
                    ["web_url", "Imagem principal (URL HTTPS ou local)"],
                    ["related_slug", "Conteúdo relacionado"],
                    ["seo_title", "Título SEO"],
                    ["seo_description", "Descrição SEO"],
                    ["canonical", "Canonical"],
                    ["og_image", "Imagem de compartilhamento"],
                    ["translation_of", "ID do conteúdo original"],
                    ["schema_json", "Schema estruturado (JSON-LD)"],
                  ])
                  .map(([key, label]) => (
                    <Field
                      key={key}
                      label={label}
                      value={editor.metadata[key]}
                      large={["spiritual_reading", "correction_notes"].includes(
                        key,
                      )}
                      onChange={(v) =>
                        setEditor({
                          ...editor,
                          metadata: { ...editor.metadata, [key]: v },
                        })
                      }
                    />
                  ))}
                <label>
                  <input
                    type="checkbox"
                    checked={!!editor.metadata.featured}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        metadata: {
                          ...editor.metadata,
                          featured: e.target.checked,
                        },
                      })
                    }
                  />{" "}
                  Destacar na galeria
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={!!editor.metadata.allow_download}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        metadata: {
                          ...editor.metadata,
                          allow_download: e.target.checked,
                        },
                      })
                    }
                  />{" "}
                  Permitir download público
                </label>
              </div>
              <div className="editor-actions">
                <button
                  className="primary"
                  disabled={
                    busy || !(can(role, "write") || can(role, "publish"))
                  }
                >
                  Salvar conteúdo
                </button>
                <button type="button" onClick={() => setPreview(editor)}>
                  Pré-visualizar
                </button>
                {editor.id && can(role, "write") && (
                  <button
                    type="button"
                    onClick={() => {
                      const {
                        id,
                        created_at,
                        created_by,
                        updated_at,
                        ...copy
                      } = editor;
                      setEditor({
                        ...copy,
                        title: copy.title + " (cópia)",
                        slug: copy.slug + "-copia-" + Date.now(),
                        status: "rascunho",
                      });
                    }}
                  >
                    Duplicar
                  </button>
                )}
                {editor.id && can(role, "publish") && (
                  <button
                    type="button"
                    onClick={() =>
                      setEditor({
                        ...editor,
                        status:
                          editor.status === "lixeira" ? "rascunho" : "lixeira",
                      })
                    }
                  >
                    {editor.status === "lixeira"
                      ? "Restaurar rascunho"
                      : "Mover para lixeira"}
                  </button>
                )}
              </div>
              <details>
                <summary>Histórico e restauração de versões</summary>
                {data.versions
                  .filter((v) => v.content_id === editor.id)
                  .map((v) => (
                    <p key={v.id}>
                      {new Date(v.created_at).toLocaleString("pt-BR")}{" "}
                      <button
                        type="button"
                        disabled={!(can(role, "write") || can(role, "publish"))}
                        onClick={() =>
                          setEditor({
                            ...v.snapshot,
                            updated_at: editor.updated_at,
                            status: "rascunho",
                          })
                        }
                      >
                        Carregar versão como rascunho
                      </button>
                    </p>
                  ))}
              </details>
              <p role="status">{message}</p>
            </form>
          </section>
        </div>
      )}
      {preview && (
        <Preview record={preview} repo={repo} close={() => setPreview(null)} />
      )}
    </div>
  );
}
function Empty({ text }) {
  return (
    <div className="empty-state">
      <span>◈</span>
      <h3>Um espaço para o próximo conteúdo.</h3>
      <p>{text || "Crie um cadastro ou envie arquivos para começar."}</p>
    </div>
  );
}
function RecordTable({ records, edit, preview }) {
  return records.length ? (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Conteúdo</th>
            <th>Categoria</th>
            <th>Status</th>
            <th>Idioma</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>
                <strong>{r.title}</strong>
                <small>{r.metadata?.code || r.slug}</small>
              </td>
              <td>{r.category || "Sem categoria"}</td>
              <td>
                <span className={`badge ${r.status}`}>{r.status}</span>
                {r.publish_at && (
                  <small>
                    {new Date(r.publish_at).toLocaleString("pt-BR")}
                  </small>
                )}
              </td>
              <td>{r.language}</td>
              <td>
                <div className="actions">
                  <button onClick={() => edit(r)}>Abrir</button>
                  <button
                    aria-label={`Pré-visualizar ${r.title}`}
                    onClick={() => preview(r)}
                  >
                    ↗
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty />
  );
}
function Contact({ value, save }) {
  const [draft, setDraft] = useState(value);
  return (
    <article className="contact-card">
      <h3>{value.name}</h3>
      <p>
        {value.email} · {value.phone} · {value.city} {value.state}
      </p>
      <p>{value.interest}</p>
      <p>{value.message}</p>
      <small>
        Consentimento: {new Date(value.consent_at).toLocaleString("pt-BR")}
      </small>
      <label>
        Status
        <select
          value={draft.status}
          onChange={(e) => setDraft({ ...draft, status: e.target.value })}
        >
          {[
            "novo",
            "em analise",
            "respondido",
            "aguardando",
            "aprovado",
            "parceiro",
            "colaborador",
            "arquivado",
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <Field
        label="Observações internas"
        large
        value={draft.notes}
        onChange={(v) => setDraft({ ...draft, notes: v })}
      />
      <button onClick={() => save(draft)}>Salvar acompanhamento</button>
    </article>
  );
}
function Settings({ value, disabled, save }) {
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState("");
  function update(path, v) {
    setDraft((previous) => {
      const next = structuredClone(previous);
      let ref = next;
      for (const key of path.slice(0, -1)) ref = ref[key];
      ref[path.at(-1)] = v;
      return next;
    });
  }
  function fields(obj, path = []) {
    return Object.entries(obj).map(([key, v]) =>
      typeof v === "string" ? (
        <Field
          key={[...path, key].join(".")}
          label={[...path, key].join(" / ")}
          value={v}
          large={v.length > 100}
          onChange={(text) => update([...path, key], text)}
        />
      ) : typeof v === "boolean" ? (
        <label key={key}>
          <input
            type="checkbox"
            checked={v}
            onChange={(e) => update([...path, key], e.target.checked)}
          />
          {key}
        </label>
      ) : v && typeof v === "object" ? (
        <details key={key} className="span-full">
          <summary>{key}</summary>
          <div className="form-grid">{fields(v, [...path, key])}</div>
        </details>
      ) : null,
    );
  }
  return (
    <section className="panel">
      <h2>Identidade, conteúdo e canais oficiais</h2>
      <p>
        Edite os textos, imagens, botões e seções da Home. As alterações salvas
        entram no site público.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          if (draft.whatsapp && !/^\d{10,15}$/.test(draft.whatsapp)) {
            setError("WhatsApp: use apenas dígitos com código do país.");
            return;
          }
          if (draft.site_url) {
            try {
              const url = new URL(draft.site_url);
              if (
                url.protocol !== "https:" ||
                url.pathname !== "/" ||
                url.username ||
                url.password ||
                url.search ||
                url.hash
              )
                throw Error();
            } catch {
              setError(
                "Domínio: informe uma origem HTTPS válida sem caminhos.",
              );
              return;
            }
          }
          if (
            draft.email &&
            !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(draft.email)
          ) {
            setError("Confira o e-mail de contato.");
            return;
          }
          save(draft);
        }}
      >
        <fieldset disabled={disabled}>
          <div className="form-grid">
            <Field
              label="WhatsApp oficial (código do país + número)"
              value={draft.whatsapp}
              onChange={(v) => update(["whatsapp"], v)}
            />
            <Field
              label="E-mail público"
              type="email"
              value={draft.email}
              onChange={(v) => update(["email"], v)}
            />
            <Field
              label="Domínio HTTPS oficial"
              value={draft.site_url}
              onChange={(v) => update(["site_url"], v)}
            />
            <Field
              label="Política de privacidade aprovada"
              large
              value={draft.privacy}
              onChange={(v) => update(["privacy"], v)}
            />
            <details className="span-full">
              <summary>Conteúdo completo da Home</summary>
              <div className="form-grid">
                {fields(draft.content, ["content"])}
              </div>
            </details>
          </div>
          <button className="primary">Publicar configurações</button>
        </fieldset>
        <p role="alert">{error}</p>
      </form>
    </section>
  );
}
function Preview({ record, repo, close }) {
  const [url, setUrl] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    repo
      .fileUrl(record)
      .then(setUrl)
      .catch((e) => setError(e.message));
  }, [record, repo]);
  return (
    <div className="modal-backdrop">
      <article
        className="editor-modal preview-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Pré-visualização"
      >
        <button className="close-preview" onClick={close}>
          Fechar pré-visualização
        </button>
        <p className="eyebrow">
          {record.category} · {record.status}
        </p>
        <h1>{record.title}</h1>
        <p>{record.description}</p>
        {url &&
        (/image/.test(record.metadata?.format || "") ||
          record.module === "artworks") ? (
          <img src={url} alt={record.metadata?.alt || record.title} />
        ) : url ? (
          <a href={url} target="_blank" rel="noopener">
            Abrir arquivo
          </a>
        ) : null}
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{record.body}</ReactMarkdown>
        {record.metadata?.spiritual_reading && (
          <p>{record.metadata.spiritual_reading}</p>
        )}
        <blockquote>{record.metadata?.biblical_reference}</blockquote>
        <p role="status">{error}</p>
      </article>
    </div>
  );
}
