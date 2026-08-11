-- Phase 2: client portal, newsletter, visa document checklists

alter table public.visa_subclasses
  add column if not exists document_checklist jsonb not null default '[]'::jsonb;

comment on column public.visa_subclasses.document_checklist is
  'Array of {id, label, required} for public/portal checklists';

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_sessions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  ip inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists client_sessions_client_id_idx
  on public.client_sessions (client_id);
create index if not exists client_sessions_expires_at_idx
  on public.client_sessions (expires_at);

create table if not exists public.matters (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  enquiry_id uuid references public.enquiries (id) on delete set null,
  visa_subclass_id uuid references public.visa_subclasses (id) on delete set null,
  title text not null,
  status text not null default 'open'
    check (status in ('open', 'in_progress', 'closed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.admins (id) on delete set null
);

create index if not exists matters_client_id_idx on public.matters (client_id);
create index if not exists matters_status_idx on public.matters (status);

create table if not exists public.matter_documents (
  id uuid primary key default gen_random_uuid(),
  matter_id uuid not null references public.matters (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  mime_type text,
  uploaded_by text not null check (uploaded_by in ('client', 'admin')),
  created_at timestamptz not null default now()
);

create index if not exists matter_documents_matter_id_idx
  on public.matter_documents (matter_id);

create table if not exists public.matter_checklist_items (
  id uuid primary key default gen_random_uuid(),
  matter_id uuid not null references public.matters (id) on delete cascade,
  label text not null,
  is_required boolean not null default true,
  is_complete boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists matter_checklist_items_matter_id_idx
  on public.matter_checklist_items (matter_id);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  locale text not null default 'en',
  is_confirmed boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists newsletter_subscribers_created_at_idx
  on public.newsletter_subscribers (created_at desc);

alter table public.clients enable row level security;
alter table public.client_sessions enable row level security;
alter table public.matters enable row level security;
alter table public.matter_documents enable row level security;
alter table public.matter_checklist_items enable row level security;
alter table public.newsletter_subscribers enable row level security;

drop policy if exists "service_role_all_clients" on public.clients;
create policy "service_role_all_clients"
  on public.clients for all to service_role
  using (true) with check (true);

drop policy if exists "service_role_all_client_sessions" on public.client_sessions;
create policy "service_role_all_client_sessions"
  on public.client_sessions for all to service_role
  using (true) with check (true);

drop policy if exists "service_role_all_matters" on public.matters;
create policy "service_role_all_matters"
  on public.matters for all to service_role
  using (true) with check (true);

drop policy if exists "service_role_all_matter_documents" on public.matter_documents;
create policy "service_role_all_matter_documents"
  on public.matter_documents for all to service_role
  using (true) with check (true);

drop policy if exists "service_role_all_matter_checklist_items"
  on public.matter_checklist_items;
create policy "service_role_all_matter_checklist_items"
  on public.matter_checklist_items for all to service_role
  using (true) with check (true);

drop policy if exists "anon_insert_newsletter_subscribers"
  on public.newsletter_subscribers;
create policy "anon_insert_newsletter_subscribers"
  on public.newsletter_subscribers for insert to anon, authenticated
  with check (true);

drop policy if exists "service_role_all_newsletter_subscribers"
  on public.newsletter_subscribers;
create policy "service_role_all_newsletter_subscribers"
  on public.newsletter_subscribers for all to service_role
  using (true) with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'client-documents',
  'client-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
