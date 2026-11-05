-- Align the existing Money Management tables and enforce user-owned access.
alter table public.transactions
  add column if not exists place text not null default '';

alter table public.transactions enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_topups enable row level security;

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

grant select, insert, update, delete on public.transactions to authenticated;
grant select, insert, update, delete on public.wallets to authenticated;
grant select, insert, update, delete on public.wallet_topups to authenticated;
