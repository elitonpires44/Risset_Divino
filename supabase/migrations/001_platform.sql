-- Execute no SQL Editor de um projeto Supabase. Não contém usuários ou senhas fixos.
begin;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '',
 role text not null default 'membro' check(role in ('super_admin','gestor','editor','revisor','colaborador','membro')),
 created_at timestamptz not null default now()
);
create function public.current_role() returns text language sql stable security definer set search_path=public as $$ select role from public.profiles where id=auth.uid() $$;
create function public.staff() returns boolean language sql stable security definer set search_path=public as $$ select coalesce(public.current_role() in ('super_admin','gestor','editor','revisor','colaborador'),false) $$;
create function public.manager() returns boolean language sql stable security definer set search_path=public as $$ select coalesce(public.current_role() in ('super_admin','gestor'),false) $$;
create function public.new_profile() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,display_name) values(new.id,coalesce(new.raw_user_meta_data->>'name',''));return new;end $$;
create trigger create_profile after insert on auth.users for each row execute function public.new_profile();
create table public.content_items (
 id uuid primary key default gen_random_uuid(),
 module text not null check(module in ('pages','artworks','archive','posts','media','rissetv','book','institute','forms','members','donations','seo','translations','tasks')),
 title text not null check(length(title) between 1 and 250),
 slug text not null check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 subtitle text not null default '', description text not null default '', body text not null default '',
 category text not null default '',tags text[] not null default '{}', language text not null default 'pt-BR',
 status text not null default 'rascunho' check(status in ('rascunho','revisao','aprovado','publicado','arquivado','lixeira')),
 visibility text not null default 'interno' check(visibility in ('publico','restrito','interno','equipe','super_admin')),
 metadata jsonb not null default '{}', sort_order integer not null default 0,
 publish_at timestamptz, created_by uuid not null default auth.uid() references auth.users(id),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 unique(module,language,slug)
);
create unique index content_public_slug on public.content_items(language,slug) where module<>'artworks';
create index content_public on public.content_items(module,status,visibility,publish_at);
create table public.site_settings(key text primary key,value jsonb not null,updated_at timestamptz not null default now());
create table public.content_versions(id uuid primary key default gen_random_uuid(),content_id uuid not null references public.content_items(id),snapshot jsonb not null,actor uuid references auth.users(id),created_at timestamptz not null default now());
create table public.audit_logs(id bigint generated always as identity primary key,actor uuid references auth.users(id),action text not null,entity text not null,entity_id text,created_at timestamptz not null default now());
create table public.contacts(id uuid primary key default gen_random_uuid(),name text not null,email text not null,phone text default '',city text default '',state text default '',interest text default '',message text default '',status text not null default 'novo' check(status in ('novo','em analise','respondido','aguardando','aprovado','parceiro','colaborador','arquivado')),notes text not null default '',consent_at timestamptz not null default now(),created_at timestamptz not null default now());
create table public.backups(id uuid primary key default gen_random_uuid(),created_by uuid not null references auth.users(id),created_at timestamptz not null default now(),payload jsonb not null);
create function public.log_change() returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.audit_logs(actor,action,entity,entity_id) values(auth.uid(),TG_OP,TG_TABLE_NAME,coalesce(to_jsonb(new)->>'id',to_jsonb(old)->>'id',to_jsonb(new)->>'key'));
 if TG_TABLE_NAME='content_items' and TG_OP='UPDATE' then insert into public.content_versions(content_id,snapshot,actor) values(old.id,to_jsonb(old),auth.uid());end if;
 return coalesce(new,old);
end $$;
create trigger content_audit after insert or update or delete on public.content_items for each row execute function public.log_change();
create trigger settings_audit after insert or update or delete on public.site_settings for each row execute function public.log_change();
create trigger profiles_audit after update on public.profiles for each row execute function public.log_change();
create trigger contacts_audit after update or delete on public.contacts for each row execute function public.log_change();
create function public.enforce_editorial() returns trigger language plpgsql security definer set search_path=public as $$
declare r text:=public.current_role();begin
 if r is null or r='membro' then raise exception 'Acesso negado';end if;
 if TG_OP='UPDATE' then
  new.created_by:=old.created_by;new.created_at:=old.created_at;
  if new.updated_at <> old.updated_at then raise exception 'Use a versão atual para salvar';end if;
  if r='colaborador' and (old.created_by<>auth.uid() or old.status not in ('rascunho','revisao')) then raise exception 'Conteúdo fora de sua permissão';end if;
 end if;
 if r in ('editor','colaborador') and new.status not in ('rascunho','revisao') then raise exception 'Publicação exige revisão';end if;
 if r in ('editor','colaborador') and TG_OP='UPDATE' and old.status not in ('rascunho','revisao') then raise exception 'Solicite revisão antes de editar conteúdo aprovado';end if;
 new.updated_at:=clock_timestamp();return new;
end $$;
create trigger editorial_guard before insert or update on public.content_items for each row execute function public.enforce_editorial();
alter table public.profiles enable row level security;
alter table public.content_items enable row level security;
alter table public.site_settings enable row level security;
alter table public.content_versions enable row level security;
alter table public.audit_logs enable row level security;
alter table public.contacts enable row level security;
alter table public.backups enable row level security;
create policy profile_read on public.profiles for select to authenticated using(id=auth.uid() or public.manager());
create policy profile_update on public.profiles for update to authenticated using(public.current_role()='super_admin') with check(public.current_role()='super_admin');
create policy content_read on public.content_items for select using(
 (status='publicado' and visibility='publico' and (publish_at is null or publish_at<=now()))
 or (public.staff() and (visibility<>'super_admin' or public.current_role()='super_admin') and (public.current_role()<>'colaborador' or created_by=auth.uid()))
 or (auth.uid() is not null and visibility='restrito' and status='publicado' and (publish_at is null or publish_at<=now()))
);
create policy content_insert on public.content_items for insert to authenticated with check(public.staff() and created_by=auth.uid() and (visibility<>'super_admin' or public.current_role()='super_admin'));
create policy content_update on public.content_items for update to authenticated using(public.staff() and (visibility<>'super_admin' or public.current_role()='super_admin') and (public.current_role()<>'colaborador' or created_by=auth.uid())) with check(public.staff() and (visibility<>'super_admin' or public.current_role()='super_admin'));
-- Exclusão definitiva só pelo Super Admin. A lixeira preserva histórico.
create policy content_delete on public.content_items for delete to authenticated using(false);
create policy settings_read on public.site_settings for select using(key='site' or public.current_role()='super_admin');
create policy settings_write on public.site_settings for all to authenticated using(public.current_role()='super_admin') with check(public.current_role()='super_admin');
create policy versions_read on public.content_versions for select to authenticated using(exists(select 1 from public.content_items where id=content_id));
create policy audit_read on public.audit_logs for select to authenticated using(public.manager());
create policy contacts_read on public.contacts for select to authenticated using(public.manager());
create policy contacts_update on public.contacts for update to authenticated using(public.manager()) with check(public.manager());
create policy backups_read on public.backups for select to authenticated using(public.current_role()='super_admin');
create function public.submit_contact(p_name text,p_email text,p_phone text,p_city text,p_state text,p_interest text,p_message text,p_consent boolean) returns uuid language plpgsql security definer set search_path=public as $$
declare result uuid;begin
 if p_consent is not true or length(trim(p_name)) not between 2 and 150 or length(p_email)>254 or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or length(p_message)>5000 or length(p_phone)>30 or length(p_city)>120 or length(p_state)>120 or length(p_interest)>150 then raise exception 'Confira os campos e o consentimento';end if;
 perform pg_advisory_xact_lock(hashtext(lower(p_email)));
 if exists(select 1 from public.contacts where email=lower(p_email) and created_at>now()-interval '1 minute') then raise exception 'Aguarde um minuto antes de reenviar';end if;
 insert into public.contacts(name,email,phone,city,state,interest,message) values(trim(p_name),lower(p_email),p_phone,p_city,p_state,p_interest,p_message) returning id into result;return result;
end $$;
create function public.create_backup() returns uuid language plpgsql security definer set search_path=public as $$
declare result uuid;begin
 if public.current_role()<>'super_admin' or public.current_role() is null then raise exception 'Acesso negado';end if;
 insert into public.backups(created_by,payload) values(auth.uid(),jsonb_build_object('version',1,'content_items',(select coalesce(jsonb_agg(t),'[]') from public.content_items t),'site_settings',(select coalesce(jsonb_agg(t),'[]') from public.site_settings t),'contacts',(select coalesce(jsonb_agg(t),'[]') from public.contacts t),'profiles',(select coalesce(jsonb_agg(t),'[]') from public.profiles t),'content_versions',(select coalesce(jsonb_agg(t),'[]') from public.content_versions t))) returning id into result;
 insert into public.audit_logs(actor,action,entity,entity_id) values(auth.uid(),'BACKUP','backups',result::text);return result;
end $$;
create function public.restore_backup(p_id uuid) returns void language plpgsql security definer set search_path=public as $$
declare snapshot jsonb;begin
 if public.current_role()<>'super_admin' or public.current_role() is null then raise exception 'Acesso negado';end if;
 select payload into snapshot from public.backups where id=p_id;
 if snapshot is null then raise exception 'Backup não encontrado';end if;
 insert into public.content_items select * from jsonb_populate_recordset(null::public.content_items,snapshot->'content_items')
 on conflict(id) do update set module=excluded.module,title=excluded.title,slug=excluded.slug,subtitle=excluded.subtitle,description=excluded.description,body=excluded.body,category=excluded.category,tags=excluded.tags,language=excluded.language,status=excluded.status,visibility=excluded.visibility,metadata=excluded.metadata,sort_order=excluded.sort_order,publish_at=excluded.publish_at,updated_at=content_items.updated_at;
 insert into public.site_settings select * from jsonb_populate_recordset(null::public.site_settings,snapshot->'site_settings')
 on conflict(key) do update set value=excluded.value,updated_at=clock_timestamp();
 insert into public.contacts select * from jsonb_populate_recordset(null::public.contacts,snapshot->'contacts')
 on conflict(id) do update set name=excluded.name,email=excluded.email,phone=excluded.phone,city=excluded.city,state=excluded.state,interest=excluded.interest,message=excluded.message,status=excluded.status,notes=excluded.notes;
 insert into public.audit_logs(actor,action,entity,entity_id) values(auth.uid(),'RESTORE','backups',p_id::text);
end $$;
revoke all on function public.restore_backup(uuid) from public,anon;
grant execute on function public.restore_backup(uuid) to authenticated;
create function public.set_user_role(p_id uuid,p_role text) returns void language plpgsql security definer set search_path=public as $$
begin
 if public.current_role()<>'super_admin' or public.current_role() is null then raise exception 'Acesso negado';end if;
 if p_id=auth.uid() and p_role<>'super_admin' then raise exception 'Não remova sua própria administração';end if;
 update public.profiles set role=p_role where id=p_id;
end $$;
-- Atualizações de perfil devem usar RPC, impedindo remoção do próprio Super Admin.
drop policy profile_update on public.profiles;
revoke all on function public.new_profile(),public.log_change(),public.enforce_editorial() from public,anon,authenticated;
revoke all on function public.create_backup(),public.set_user_role(uuid,text) from public,anon;
grant execute on function public.create_backup(),public.set_user_role(uuid,text) to authenticated;
revoke all on function public.submit_contact(text,text,text,text,text,text,text,boolean) from public;
grant execute on function public.submit_contact(text,text,text,text,text,text,text,boolean) to anon,authenticated;
grant select on public.content_items,public.site_settings to anon;
grant select,insert,update on public.content_items,public.site_settings to authenticated;
grant select,update on public.contacts to authenticated;
grant select on public.profiles,public.content_versions,public.audit_logs,public.backups to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('risset-media','risset-media',false,52428800,array['image/png','image/jpeg','image/webp','application/pdf','audio/mpeg','audio/wav','video/mp4','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.presentationml.presentation']) on conflict(id) do nothing;
create policy media_read on storage.objects for select using(bucket_id='risset-media' and (
 (public.current_role()='super_admin' or owner_id=auth.uid()::text and public.staff())
 or exists(select 1 from public.content_items c where (c.metadata->>'storage_path'=name or coalesce(c.metadata->'storage_paths','[]'::jsonb) ? name) and ((c.status='publicado' and c.visibility='publico' and (c.publish_at is null or c.publish_at<=now())) or public.staff()))
));
create policy media_upload on storage.objects for insert to authenticated with check(bucket_id='risset-media' and public.current_role() in ('super_admin','gestor','editor','colaborador') and (storage.foldername(name))[1]=auth.uid()::text);
-- Arquivos versionados nunca sobrescritos; remoção exige Super Admin.
create policy media_delete on storage.objects for delete to authenticated using(bucket_id='risset-media' and public.current_role()='super_admin');
commit;
