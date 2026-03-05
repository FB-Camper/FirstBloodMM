create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  x_user_id text unique not null,
  username text not null,
  created_at timestamptz not null default now()
);

create table if not exists brackets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  handle text not null,
  picks_json jsonb not null default '{}'::jsonb,
  champion text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_brackets_updated_at on brackets(updated_at desc);
create index if not exists idx_brackets_submitted_at on brackets(submitted_at asc);

create table if not exists results (
  match_id text primary key,
  winner_name text not null,
  updated_at timestamptz not null default now()
);

create table if not exists tournament_settings (
  id smallint primary key default 1,
  lock_timestamp timestamptz not null
);

insert into tournament_settings (id, lock_timestamp)
values (1, '2026-03-17T04:00:00Z')
on conflict (id) do update
set lock_timestamp = excluded.lock_timestamp;
