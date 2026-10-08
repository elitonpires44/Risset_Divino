import { safeUrl } from "./modules.js";
import { seedRecords, settingsSeed } from "./seed.js";
const demoKey = "risset-explicit-demo-v1";
function demoState() {
  const raw = localStorage.getItem(demoKey);
  if (raw) return JSON.parse(raw);
  return {
    records: seedRecords(),
    settings: settingsSeed.value,
    contacts: [],
    profiles: [
      {
        id: "demo-admin",
        display_name: "Administração demonstrativa",
        role: "super_admin",
      },
    ],
    logs: [],
    backups: [],
    versions: [],
  };
}
function saveDemo(state) {
  localStorage.setItem(demoKey, JSON.stringify(state));
}
function check(result) {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}
export function repository(db, demo = false) {
  return {
    async load() {
      if (demo) return demoState();
      const names = [
        "content_items",
        "site_settings",
        "contacts",
        "profiles",
        "audit_logs",
        "backups",
        "content_versions",
      ];
      const results = await Promise.all(
        names.map((name) =>
          db
            .from(name)
            .select(name === "backups" ? "id,created_at,created_by" : "*")
            .order(
              name === "site_settings"
                ? "key"
                : name === "content_items"
                  ? "updated_at"
                  : "created_at",
              { ascending: false },
            )
            .limit(1000),
        ),
      );
      const [records, settings, contacts, profiles, logs, backups, versions] =
        results.map(check);
      return {
        records,
        settings:
          settings.find((s) => s.key === "site")?.value || settingsSeed.value,
        contacts,
        profiles,
        logs,
        backups,
        versions,
      };
    },
    async save(record) {
      if (demo) {
        const state = demoState();
        const old = state.records.find((r) => r.id === record.id);
        const next = {
          ...record,
          id: record.id || crypto.randomUUID(),
          updated_at: new Date().toISOString(),
        };
        if (old) {
          state.versions.push({
            id: crypto.randomUUID(),
            content_id: old.id,
            snapshot: old,
            created_at: next.updated_at,
          });
          state.records = state.records.map((r) =>
            r.id === next.id ? next : r,
          );
        } else state.records.push(next);
        state.logs.unshift({
          id: crypto.randomUUID(),
          action: old ? "UPDATE" : "INSERT",
          entity: record.module,
          created_at: next.updated_at,
        });
        saveDemo(state);
        return next;
      }
      const { id, created_at, created_by, ...payload } = record;
      if (id)
        return check(
          await db
            .from("content_items")
            .update(payload)
            .eq("id", id)
            .eq("updated_at", record.updated_at)
            .select()
            .single(),
        );
      return check(
        await db.from("content_items").insert(payload).select().single(),
      );
    },
    async settings(value) {
      if (demo) {
        const state = demoState();
        state.settings = value;
        saveDemo(state);
        return;
      }
      check(
        await db
          .from("site_settings")
          .upsert({ key: "site", value, updated_at: new Date().toISOString() }),
      );
    },
    async contact(record) {
      if (demo) {
        const state = demoState();
        state.contacts = state.contacts.map((c) =>
          c.id === record.id ? record : c,
        );
        saveDemo(state);
        return;
      }
      check(
        await db
          .from("contacts")
          .update({ status: record.status, notes: record.notes })
          .eq("id", record.id),
      );
    },
    async role(id, role) {
      if (demo) {
        const state = demoState();
        state.profiles = state.profiles.map((p) =>
          p.id === id ? { ...p, role } : p,
        );
        saveDemo(state);
        return;
      }
      check(await db.rpc("set_user_role", { p_id: id, p_role: role }));
    },
    async backup() {
      if (demo) {
        const state = demoState();
        const payload = structuredClone({ ...state, backups: [] });
        const id = crypto.randomUUID();
        state.backups.unshift({
          id,
          created_at: new Date().toISOString(),
          payload,
        });
        saveDemo(state);
        return payload;
      }
      const id = check(await db.rpc("create_backup"));
      return check(
        await db.from("backups").select("payload").eq("id", id).single(),
      ).payload;
    },
    async restoreBackup(id) {
      if (demo) {
        const state = demoState();
        const backup = state.backups.find((b) => b.id === id);
        if (!backup) throw new Error("Backup não encontrado");
        for (const record of backup.payload.records) {
          const index = state.records.findIndex((r) => r.id === record.id);
          if (index >= 0) state.records[index] = record;
          else state.records.push(record);
        }
        state.settings = backup.payload.settings;
        state.contacts = backup.payload.contacts;
        saveDemo(state);
        return;
      }
      check(await db.rpc("restore_backup", { p_id: id }));
    },
    async upload(file, module, category) {
      const allowed = [
        "image/png",
        "image/jpeg",
        "image/webp",
        "application/pdf",
        "audio/mpeg",
        "audio/wav",
        "video/mp4",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ];
      if (!allowed.includes(file.type) || file.size > 50 * 1024 * 1024)
        throw new Error("Formato não permitido ou arquivo acima de 50 MB.");
      if (demo)
        throw new Error(
          "Uploads reais exigem conexão Supabase. A demonstração não envia arquivos.",
        );
      const user = check(await db.auth.getUser()).user;
      const path = `${user.id}/${crypto.randomUUID()}/${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      check(
        await db.storage
          .from("risset-media")
          .upload(path, file, { upsert: false, contentType: file.type }),
      );
      let dimensions = {};
      const storagePaths = [path];
      let webPath = "";
      let thumbPath = "";
      if (file.type.startsWith("image/")) {
        const bitmap = await createImageBitmap(file);
        dimensions = {
          width: bitmap.width,
          height: bitmap.height,
          orientation:
            bitmap.width >= bitmap.height ? "horizontal" : "vertical",
        };
        for (const [name, size] of [
          ["web", 1600],
          ["thumb", 480],
        ]) {
          const ratio = Math.min(1, size / bitmap.width);
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(bitmap.width * ratio);
          canvas.height = Math.round(bitmap.height * ratio);
          canvas
            .getContext("2d")
            .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
          const blob = await new Promise((resolve) =>
            canvas.toBlob(resolve, "image/webp", 0.92),
          );
          if (!blob) throw new Error("Não foi possível gerar a versão web");
          const generated = path + "-" + name + ".webp";
          check(
            await db.storage
              .from("risset-media")
              .upload(generated, blob, {
                upsert: false,
                contentType: "image/webp",
              }),
          );
          storagePaths.push(generated);
          if (name === "web") webPath = generated;
          else thumbPath = generated;
        }
        bitmap.close();
      }
      try {
        return await this.save({
          module,
          title: file.name,
          slug: `arquivo-${crypto.randomUUID()}`,
          description: "",
          body: "",
          category,
          tags: [],
          language: "pt-BR",
          status: "rascunho",
          visibility: "interno",
          sort_order: 0,
          publish_at: null,
          metadata: {
            storage_path: path,
            storage_paths: storagePaths,
            web_path: webPath,
            thumbnail_path: thumbPath,
            format: file.type,
            bytes: file.size,
            ...dimensions,
          },
        });
      } catch (error) {
        throw new Error(
          `Arquivo enviado, mas cadastro não foi salvo: ${error.message}. Caminho para recuperação: ${path}`,
        );
      }
    },
    async fileUrl(record) {
      const path = record.metadata?.storage_path;
      if (!path)
        return (
          safeUrl(record.metadata?.web_url) ||
          safeUrl(record.metadata?.original_url) ||
          ""
        );
      if (demo) return "";
      return check(
        await db.storage.from("risset-media").createSignedUrl(path, 300),
      ).signedUrl;
    },
  };
}
