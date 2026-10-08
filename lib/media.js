import { publicClient } from "./supabase";
import { safeUrl } from "./modules";
export async function withMedia(records) {
  const db = publicClient();
  return Promise.all(
    records.map(async (r) => {
      let fileUrl =
        safeUrl(r.metadata?.web_url) || safeUrl(r.metadata?.original_url);
      if (db && r.metadata?.storage_path) {
        const { data, error } = await db.storage
          .from("risset-media")
          .createSignedUrl(r.metadata.web_path || r.metadata.storage_path, 300);
        if (!error) fileUrl = data.signedUrl;
      }
      return { ...r, fileUrl };
    }),
  );
}
