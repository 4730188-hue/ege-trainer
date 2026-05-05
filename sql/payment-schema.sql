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


alter table payments add column if not exists telegram_id text;
alter table payments add column if not exists telegram_username text;
alter table payments add column if not exists telegram_first_name text;
alter table payments add column if not exists telegram_last_name text;

alter table subscriptions add column if not exists telegram_id text;
alter table subscriptions add column if not exists telegram_username text;
alter table subscriptions add column if not exists telegram_first_name text;
alter table subscriptions add column if not exists telegram_last_name text;

create table if not exists support_messages (
  id bigserial primary key,
  admin_chat_id text not null,
  admin_message_id bigint not null,
  user_chat_id text not null,
  user_message_id bigint,
  telegram_username text,
  telegram_first_name text,
  telegram_last_name text,
  created_at timestamptz not null default now()
);

create index if not exists support_messages_admin_reply_idx
  on support_messages(admin_chat_id, admin_message_id);
