-- Amity Immigration Services — initial schema
-- Custom auth (no Supabase Auth). All admin access via service-role key server-side.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------

create extension if not exists citext with schema public;
create extension if not exists pgcrypto with schema public;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level int not null,
  scope text not null check (scope in ('team', 'global')),
  created_at timestamptz not null default now()
);

create table public.admins (
  id uuid primary key default gen_random_uuid(),
  username citext unique not null,
  password_hash text not null,
  role_id uuid references public.roles (id) on delete restrict,
  team_id uuid references public.teams (id) on delete restrict,
  is_active boolean not null default true,
  last_login_at timestamptz,
  failed_login_count int not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now()
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.admins (id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  ip inet,
  user_agent text
);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  blocks jsonb not null default '[]'::jsonb,
  meta_title text,
  meta_description text,
  team_id uuid references public.teams (id) on delete restrict,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.admins (id) on delete set null
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  summary text,
  body jsonb not null default '[]'::jsonb,
  icon text,
  sort_order int not null default 0,
  is_published boolean not null default false,
  team_id uuid references public.teams (id) on delete restrict,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.admins (id) on delete set null
);

create table public.visa_subclasses (
  id uuid primary key default gen_random_uuid(),
  subclass_number text not null,
  name text not null,
  slug text unique not null,
  stream text not null check (
    stream in (
      'skilled',
      'employer',
      'family',
      'student',
      'business',
      'visitor',
      'humanitarian',
      'bridging',
      'other'
    )
  ),
  visa_type text not null check (visa_type in ('temporary', 'permanent')),
  pr_pathway boolean not null default false,
  status text not null default 'active' check (
    status in ('active', 'closing', 'closed', 'replaced')
  ),
  eligibility_summary text,
  body jsonb not null default '[]'::jsonb,
  processing_context text,
  sort_order int not null default 0,
  is_published boolean not null default false,
  team_id uuid references public.teams (id) on delete restrict,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.admins (id) on delete set null
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  body jsonb not null default '[]'::jsonb,
  cover_url text,
  author_name text,
  published_at timestamptz,
  is_published boolean not null default false,
  team_id uuid references public.teams (id) on delete restrict,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.admins (id) on delete set null
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role_title text,
  bio text,
  photo_url text,
  sort_order int not null default 0,
  is_published boolean not null default false,
  team_id uuid references public.teams (id) on delete restrict,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.admins (id) on delete set null
);

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  visa_interest text,
  message text not null,
  status text not null default 'new' check (
    status in ('new', 'in_progress', 'closed')
  ),
  source_page text,
  created_at timestamptz not null default now()
);

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.admins (id) on delete set null
);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  actor_admin_id uuid references public.admins (id) on delete set null,
  target_table text not null,
  target_id uuid,
  before_state jsonb,
  after_state jsonb,
  ip inet,
  user_agent text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index audit_log_created_at_idx on public.audit_log (created_at desc);
create index audit_log_actor_admin_id_idx on public.audit_log (actor_admin_id);
create index audit_log_target_idx on public.audit_log (target_table, target_id);

create index posts_published_idx on public.posts (is_published, published_at desc);

create index visa_subclasses_stream_published_idx
  on public.visa_subclasses (stream, is_published);
create index visa_subclasses_status_idx on public.visa_subclasses (status);

create index services_published_sort_idx
  on public.services (is_published, sort_order);

create index sessions_admin_id_idx on public.sessions (admin_id);
create index sessions_expires_at_idx on public.sessions (expires_at);

create index enquiries_status_created_at_idx
  on public.enquiries (status, created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.teams enable row level security;
alter table public.roles enable row level security;
alter table public.admins enable row level security;
alter table public.sessions enable row level security;
alter table public.pages enable row level security;
alter table public.services enable row level security;
alter table public.visa_subclasses enable row level security;
alter table public.posts enable row level security;
alter table public.team_members enable row level security;
alter table public.enquiries enable row level security;
alter table public.site_settings enable row level security;
alter table public.audit_log enable row level security;

-- Public read: pages (no is_published column — all rows are web-facing when linked)
create policy "anon_select_pages"
  on public.pages
  for select
  to anon
  using (true);

-- Public read: published content only
create policy "anon_select_published_services"
  on public.services
  for select
  to anon
  using (is_published = true);

create policy "anon_select_published_visa_subclasses"
  on public.visa_subclasses
  for select
  to anon
  using (is_published = true);

create policy "anon_select_published_posts"
  on public.posts
  for select
  to anon
  using (is_published = true);

create policy "anon_select_published_team_members"
  on public.team_members
  for select
  to anon
  using (is_published = true);

create policy "anon_select_site_settings"
  on public.site_settings
  for select
  to anon
  using (true);

-- Public contact form: insert only, never read
create policy "anon_insert_enquiries"
  on public.enquiries
  for insert
  to anon
  with check (true);

-- No anon policies on teams, roles, admins, sessions, audit_log.
-- Admin reads/writes use the service-role key in Server Actions (bypasses RLS).
