-- =====================================================================
-- Money Management – Complete Supabase Database Schema & RLS Setup
-- =====================================================================

-- 1. Transactions Table
create table if not exists public.transactions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  title text not null default '',
  amount numeric not null check (amount >= 0),
  currency text not null,
  category text not null default '',
  place text not null default '',
  transaction_date text not null,
  payment_method text not null default '',
  description text not null default '',
  created_at timestamptz not null default now()
);

-- Ensure 'place' column exists even if table was created in an earlier migration
alter table public.transactions
  add column if not exists place text not null default '';

-- 2. Wallets Table
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  currency text not null,
  starting_balance numeric not null default 0,
  created_at timestamptz not null default now(),
  constraint wallets_user_currency_key unique (user_id, currency)
);

-- 3. Wallet Top-ups Table
create table if not exists public.wallet_topups (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null check (amount >= 0),
  currency text not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

-- =====================================================================
-- Enable Row Level Security (RLS) on all tables
-- =====================================================================
alter table public.transactions enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_topups enable row level security;

-- Transactions policies
drop policy if exists money_management_transactions_owner on public.transactions;
create policy money_management_transactions_owner
  on public.transactions as permissive for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists money_management_transactions_owner_boundary on public.transactions;
create policy money_management_transactions_owner_boundary
  on public.transactions as restrictive for all to public
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Wallets policies
drop policy if exists money_management_wallets_owner on public.wallets;
create policy money_management_wallets_owner
  on public.wallets as permissive for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists money_management_wallets_owner_boundary on public.wallets;
create policy money_management_wallets_owner_boundary
  on public.wallets as restrictive for all to public
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Wallet topups policies
drop policy if exists money_management_wallet_topups_owner on public.wallet_topups;
create policy money_management_wallet_topups_owner
  on public.wallet_topups as permissive for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists money_management_wallet_topups_owner_boundary on public.wallet_topups;
create policy money_management_wallet_topups_owner_boundary
  on public.wallet_topups as restrictive for all to public
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =====================================================================
-- Table Permissions
-- =====================================================================
grant select, insert, update, delete on public.transactions to authenticated;
grant select, insert, update, delete on public.wallets to authenticated;
grant select, insert, update, delete on public.wallet_topups to authenticated;
