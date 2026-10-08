import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
test("migração Postgres: RLS, publicação, arquivos, CRM e governança", async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon;create role authenticated;create schema auth;create schema storage;
 create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text,owner_id text);alter table storage.objects enable row level security;
 create function storage.foldername(text) returns text[] language sql as $$select string_to_array($1,'/')$$;
 grant usage on schema auth,public,storage to anon,authenticated;
 grant select,insert,update,delete on storage.objects to authenticated;grant select on storage.objects to anon;`);
    await db.exec(
      await readFile(
        new URL("../supabase/migrations/001_platform.sql", import.meta.url),
        "utf8",
      ),
    );
    const admin = "11111111-1111-4111-8111-111111111111",
      editor = "22222222-2222-4222-8222-222222222222",
      collaborator = "33333333-3333-4333-8333-333333333333";
    await db.exec(
      `insert into auth.users(id) values('${admin}'),('${editor}'),('${collaborator}');update public.profiles set role='super_admin' where id='${admin}';update public.profiles set role='editor' where id='${editor}';update public.profiles set role='colaborador' where id='${collaborator}';`,
    );
    async function as(role, id = "") {
      await db.exec(
        `reset role;set request.jwt.claim.sub='${id}';set role ${role};`,
      );
    }
    await as("authenticated", admin);
    const inserted = await db.query(
      `insert into content_items(module,title,slug,status,visibility,metadata) values('artworks','Arte pública','arte-publica','publicado','publico','{"storage_path":"public.png"}'),('archive','Documento interno','interno','rascunho','super_admin','{"storage_path":"secret.pdf"}'),('pages','Agendado','agendado','publicado','publico','{}') returning id`,
    );
    await db.exec(
      `update content_items set publish_at=now()+interval '1 day' where slug='agendado';`,
    );
    await db.exec(
      `reset role;insert into storage.objects(bucket_id,name,owner_id) values('risset-media','public.png','${admin}'),('risset-media','secret.pdf','${admin}');`,
    );
    await as("anon");
    assert.equal(
      (await db.query("select title from content_items")).rows.length,
      1,
    );
    assert.deepEqual(
      (await db.query("select name from storage.objects")).rows.map(
        (r) => r.name,
      ),
      ["public.png"],
    );
    await assert.rejects(
      db.exec(
        `insert into content_items(module,title,slug) values('pages','Ataque','ataque')`,
      ),
    );
    await assert.rejects(db.exec("select * from contacts"));
    await db.query(
      `select submit_contact('Participante','pessoa@example.org','','','','Contato','Mensagem',true)`,
    );
    await assert.rejects(
      db.query(
        `select submit_contact('Participante','pessoa@example.org','','','','Contato','Mensagem',true)`,
      ),
    );
    await assert.rejects(
      db.query(
        `select submit_contact('Participante','outro@example.org','','','','Contato','Mensagem',false)`,
      ),
    );
    await as("authenticated", editor);
    assert.equal((await db.query("select * from contacts")).rows.length, 0);
    assert.equal(
      (await db.query("select * from storage.objects where name='secret.pdf'"))
        .rows.length,
      0,
    );
    await assert.rejects(
      db.exec(
        `insert into content_items(module,title,slug,status,visibility) values('pages','Publicação indevida','indevida','publicado','publico')`,
      ),
    );
    const own = (
      await db.query(
        `insert into content_items(module,title,slug) values('pages','Rascunho editorial','rascunho-editor') returning id`,
      )
    ).rows[0].id;
    await assert.rejects(
      db.exec(`update profiles set role='super_admin' where id='${editor}'`),
    );
    await assert.rejects(
      db.query(`select set_user_role('${editor}','super_admin')`),
    );
    await as("authenticated", collaborator);
    assert.equal(
      (await db.query(`select * from content_items where id='${own}'`)).rows
        .length,
      0,
    );
    await as("authenticated", admin);
    await db.exec(
      `update content_items set title='Versão revisada',status='publicado',visibility='publico' where id='${own}'`,
    );
    assert.equal(
      (
        await db.query(
          `select * from content_versions where content_id='${own}'`,
        )
      ).rows.length,
      1,
    );
    assert.equal((await db.query("select * from contacts")).rows.length, 1);
    const backup = (await db.query("select create_backup() as id")).rows[0].id;
    assert(backup);
    assert.equal((await db.query("select * from backups")).rows.length, 1);
    await db.exec(
      `update content_items set title='Alterado depois do backup' where id='${own}'`,
    );
    await db.query(`select restore_backup('${backup}')`);
    assert.equal(
      (await db.query(`select title from content_items where id='${own}'`))
        .rows[0].title,
      "Versão revisada",
    );
    await as("authenticated", editor);
    await assert.rejects(db.query(`select restore_backup('${backup}')`));
    await as("authenticated", admin);
    await assert.rejects(db.query(`select set_user_role('${admin}','membro')`));
    assert((await db.query("select * from audit_logs")).rows.length >= 4);
  } finally {
    await db.close();
  }
});
