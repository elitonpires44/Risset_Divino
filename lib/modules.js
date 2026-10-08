export const roles = [
  "super_admin",
  "gestor",
  "editor",
  "revisor",
  "colaborador",
  "membro",
];
export const statuses = [
  "rascunho",
  "revisao",
  "aprovado",
  "publicado",
  "arquivado",
  "lixeira",
];
export const labels = {
  super_admin: "Super Admin",
  gestor: "Gestor",
  editor: "Editor",
  revisor: "Revisor",
  colaborador: "Colaborador",
  membro: "Membro",
};
export const modules = [
  { id: "pages", label: "Páginas", icon: "▤" },
  { id: "artworks", label: "Imagens / Artes", icon: "◈" },
  { id: "archive", label: "Acervo digital", icon: "▥" },
  { id: "posts", label: "Blog / Estudos", icon: "✎" },
  { id: "media", label: "Mídias", icon: "♫" },
  { id: "rissetv", label: "RISSETV", icon: "▷" },
  { id: "book", label: "Livro / BN / RP", icon: "▣" },
  { id: "institute", label: "Instituto", icon: "⌂" },
  { id: "forms", label: "Formulários", icon: "☷" },
  { id: "contacts", label: "Contatos / CRM", icon: "◎" },
  { id: "members", label: "Membros", icon: "♧" },
  { id: "donations", label: "Doações", icon: "♡" },
  { id: "seo", label: "SEO / GEO", icon: "⌕" },
  { id: "translations", label: "Idiomas", icon: "文" },
  { id: "users", label: "Usuários", icon: "♙" },
  { id: "permissions", label: "Permissões", icon: "⌘" },
  { id: "settings", label: "Configurações", icon: "⚙" },
  { id: "logs", label: "Logs", icon: "≡" },
  { id: "backups", label: "Backups", icon: "↺" },
  { id: "tasks", label: "Tarefas", icon: "✓" },
];
export const contentModules = modules.filter(
  (m) =>
    ![
      "users",
      "permissions",
      "settings",
      "logs",
      "backups",
      "contacts",
    ].includes(m.id),
);
export function can(role, action) {
  if (role === "super_admin") return true;
  if (["settings", "users", "backup", "delete"].includes(action)) return false;
  if (role === "gestor") return true;
  if (action === "read")
    return ["editor", "revisor", "colaborador"].includes(role);
  if (action === "publish") return role === "revisor";
  if (action === "write") return ["editor", "colaborador"].includes(role);
  return false;
}
export function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
export function isPublic(record, now = Date.now()) {
  return (
    record.status === "publicado" &&
    record.visibility === "publico" &&
    (!record.publish_at || new Date(record.publish_at).getTime() <= now)
  );
}
export function safeUrl(value) {
  if (!value) return "";
  return /^(https:\/\/|\/(?!\/))/.test(value) ? value : "";
}
export const artworkFields = [
  ["code", "Código"],
  ["subtitle", "Subtítulo"],
  ["series", "Série"],
  ["number", "Número"],
  ["version", "Versão"],
  ["spiritual_reading", "Leitura espiritual"],
  ["biblical_reference", "Referência bíblica"],
  ["theme", "Tema"],
  ["symbol", "Símbolo"],
  ["axis", "Plano / Padrão / Ordem / Propósito"],
  ["chapter", "Bloco / Capítulo / Porção"],
  ["collection", "Coleção"],
  ["catalog", "Catálogo BN / RP"],
  ["audience", "Público-alvo"],
  ["recommended_use", "Uso recomendado"],
  ["alt", "Texto alternativo"],
  ["caption", "Legenda"],
  ["palette", "Paleta"],
  ["author", "Autoria / Origem"],
  ["rights", "Direitos"],
  ["print_url", "Versão impressão"],
  ["correction_notes", "Notas de correção"],
];
