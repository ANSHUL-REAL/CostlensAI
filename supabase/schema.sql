-- =============================================================
-- CostLens AI — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- =============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Users (synced from auth.users on first login) ───────────
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null unique,
  role        text not null check (role in ('admin','finance_manager','project_manager','leadership_viewer')),
  created_at  timestamptz default now()
);

-- ── Employees ───────────────────────────────────────────────
create table if not exists public.employees (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text not null unique,   -- attendee matching key
  role        text not null,
  department  text not null,
  hourly_rate numeric(10,2) not null, -- sensitive — strip in API for non-admin
  cost_band   text,
  status      text not null default 'active' check (status in ('active','inactive')),
  created_at  timestamptz default now()
);

-- ── Projects ─────────────────────────────────────────────────
create table if not exists public.projects (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  budget      numeric(12,2) default 0,  -- weekly budget
  priority    text not null default 'Medium' check (priority in ('High','Medium','Low','None')),
  owner_id    uuid references public.users(id),
  keywords    text[] default '{}',
  status      text not null default 'active' check (status in ('active','archived')),
  created_at  timestamptz default now()
);

-- ── Meetings ──────────────────────────────────────────────────
create table if not exists public.meetings (
  id                 uuid primary key default uuid_generate_v4(),
  calendar_event_id  text unique,         -- dedupe key
  title              text not null,
  description        text,
  start_time         timestamptz not null,
  end_time           timestamptz not null,
  duration_minutes   int not null,
  organizer_email    text,
  project_id         uuid references public.projects(id),
  ai_confidence      numeric(4,3),        -- 0.000–1.000
  ai_reason          text,
  ai_tags            text[] default '{}',
  total_cost         numeric(12,2) default 0,
  is_recurring       boolean default false,
  needs_review       boolean default false,
  status             text not null default 'imported'
                     check (status in ('imported','attributed','reviewed','unclassified')),
  created_at         timestamptz default now()
);

-- ── Meeting attendees ─────────────────────────────────────────
create table if not exists public.meeting_attendees (
  id                   uuid primary key default uuid_generate_v4(),
  meeting_id           uuid not null references public.meetings(id) on delete cascade,
  employee_id          uuid references public.employees(id),   -- nullable for unmatched
  email                text not null,
  hourly_rate_snapshot numeric(10,2) default 0,  -- rate at import time
  cost_contribution    numeric(12,2) default 0,
  created_at           timestamptz default now()
);

-- ── Anomalies ─────────────────────────────────────────────────
create table if not exists public.anomalies (
  id               uuid primary key default uuid_generate_v4(),
  type             text not null,
  severity         text not null check (severity in ('high','medium','low')),
  message          text not null,
  project_id       uuid references public.projects(id),
  meeting_id       uuid references public.meetings(id),
  estimated_loss   numeric(12,2) default 0,
  suggested_action text,
  resolved         boolean default false,
  created_at       timestamptz default now()
);

-- ── Recommendations (AI Cost Optimizer) ──────────────────────
create table if not exists public.recommendations (
  id                       uuid primary key default uuid_generate_v4(),
  project_id               uuid references public.projects(id),
  title                    text not null,
  reason                   text,
  estimated_monthly_saving numeric(12,2) default 0,
  priority                 text not null check (priority in ('high','medium','low')),
  status                   text not null default 'open' check (status in ('open','applied','dismissed')),
  created_at               timestamptz default now()
);

-- ── Shadow projects ───────────────────────────────────────────
create table if not exists public.shadow_projects (
  id             uuid primary key default uuid_generate_v4(),
  suggested_name text not null,
  keywords       text[] default '{}',
  meeting_count  int default 0,
  estimated_cost numeric(12,2) default 0,
  status         text default 'detected' check (status in ('detected','promoted','dismissed')),
  created_at     timestamptz default now()
);

-- ── Google OAuth tokens (server-only, deny all anon) ─────────
create table if not exists public.google_tokens (
  user_id       uuid primary key references public.users(id) on delete cascade,
  access_token  text not null,
  refresh_token text,
  expiry        timestamptz,
  updated_at    timestamptz default now()
);

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

alter table public.users             enable row level security;
alter table public.employees         enable row level security;
alter table public.projects          enable row level security;
alter table public.meetings          enable row level security;
alter table public.meeting_attendees enable row level security;
alter table public.anomalies         enable row level security;
alter table public.recommendations   enable row level security;
alter table public.shadow_projects   enable row level security;
alter table public.google_tokens     enable row level security;

-- Users can read and maintain only their own profile row
create policy "Users read own profile" on public.users
  for select using (auth.uid() = id);
create policy "Users update own profile" on public.users
  for update using (auth.uid() = id);

-- Authenticated users can read most tables
-- (exact hourly_rate stripping is enforced in the API layer by role check)
create policy "Authed users read employees"    on public.employees          for select using (auth.role() = 'authenticated');
create policy "Authed users read projects"     on public.projects           for select using (auth.role() = 'authenticated');
create policy "Authed users read meetings"     on public.meetings           for select using (auth.role() = 'authenticated');
create policy "Authed users read attendees"    on public.meeting_attendees  for select using (auth.role() = 'authenticated');
create policy "Authed users read anomalies"    on public.anomalies          for select using (auth.role() = 'authenticated');
create policy "Authed users read recs"         on public.recommendations    for select using (auth.role() = 'authenticated');
create policy "Authed users read shadow"       on public.shadow_projects    for select using (auth.role() = 'authenticated');

-- Writes require authentication (further role checks happen in API Routes)
create policy "Authed write employees"    on public.employees          for all using (auth.role() = 'authenticated');
create policy "Authed write projects"     on public.projects           for all using (auth.role() = 'authenticated');
create policy "Authed write meetings"     on public.meetings           for all using (auth.role() = 'authenticated');
create policy "Authed write attendees"    on public.meeting_attendees  for all using (auth.role() = 'authenticated');
create policy "Authed write anomalies"    on public.anomalies          for all using (auth.role() = 'authenticated');
create policy "Authed write recs"         on public.recommendations    for all using (auth.role() = 'authenticated');
create policy "Authed write shadow"       on public.shadow_projects    for all using (auth.role() = 'authenticated');

-- google_tokens: DENY everything to anon/authenticated; use service role only
create policy "Deny anon google tokens" on public.google_tokens for all using (false);
