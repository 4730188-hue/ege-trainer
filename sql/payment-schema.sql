create extension if not exists pgcrypto;

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  yookassa_payment_id text unique,
  user_id text not null,
  plan text not null,
  amount numeric(10,2) not null,
  currency text not null default 'RUB',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text unique not null,
  plan text not null,
  active boolean not null default true,
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create index if not exists payments_user_id_idx on payments(user_id);
create index if not exists subscriptions_user_id_idx on subscriptions(user_id);
