import { publicClient } from "./supabase";
import { isPublic } from "./modules";
export async function publicRecords(module) {
  const db = publicClient();
  if (!db) return [];
  let query = db
    .from("content_items")
    .select("*")
    .eq("language", "pt-BR")
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (module) query = query.eq("module", module);
  const { data, error } = await query;
  if (error)
    throw new Error("Não foi possível consultar os conteúdos publicados.");
  return (data || []).filter((item) => isPublic(item));
}
export async function siteSettings() {
  const db = publicClient();
  if (!db) return null;
  const { data, error } = await db
    .from("site_settings")
    .select("value")
    .eq("key", "site")
    .maybeSingle();
  if (error)
    throw new Error("Não foi possível consultar as configurações públicas.");
  return data?.value || null;
}
