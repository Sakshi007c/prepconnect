create table if not exists public.study_materials (
  id uuid primary key default gen_random_uuid(),
  subject_key text not null unique,
  title text not null,
  description text not null default '',
  questions jsonb not null default '[]'::jsonb,
  resources jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
