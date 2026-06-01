-- 一口腸粉會員系統 schema
-- 目標：會員個資只存在後端資料庫，前端不永久保存敏感資料。

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  display_name text,
  phone text,
  birthday date,
  preferred_taste text,
  marketing_opt_in boolean not null default true,
  points integer not null default 0 check (points >= 0),
  tier text not null default '竹籠會員',
  source text not null default 'brand-site',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_members_updated_at on public.members;
create trigger set_members_updated_at
before update on public.members
for each row
execute function public.set_updated_at();

create table if not exists public.member_identities (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  provider text not null check (provider in ('line', 'google', 'phone')),
  provider_subject text not null,
  email text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, provider_subject)
);
create index if not exists member_identities_member_id_idx on public.member_identities(member_id);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete set null,
  pos_order_id text,
  channel text not null check (channel in ('pos', 'line-order', 'uber-eats', 'manual')),
  store_id text not null default 'yikou-main',
  total_amount integer not null default 0 check (total_amount >= 0),
  payment_status text not null default 'paid',
  fulfillment_status text not null default 'completed',
  created_at timestamptz not null default now()
);
create index if not exists orders_member_id_created_at_idx on public.orders(member_id, created_at desc);
create unique index if not exists orders_pos_order_id_unique_idx on public.orders(pos_order_id) where pos_order_id is not null;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  item_name text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price integer not null default 0 check (unit_price >= 0)
);
create index if not exists order_items_order_id_idx on public.order_items(order_id);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete cascade,
  title text not null,
  detail text not null,
  type text not null check (type in ('amount_off', 'percent_off', 'free_addon')),
  value integer not null default 0,
  status text not null default 'available' check (status in ('available', 'redeemed', 'expired', 'void')),
  expires_at timestamptz,
  issued_by text not null default 'system',
  created_at timestamptz not null default now()
);
create index if not exists coupons_member_id_status_idx on public.coupons(member_id, status);

create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  redeemed_by text not null,
  redeemed_at timestamptz not null default now()
);
create index if not exists coupon_redemptions_coupon_id_idx on public.coupon_redemptions(coupon_id);

create table if not exists public.point_ledger (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  delta integer not null,
  reason text not null,
  created_by text not null default 'system',
  created_at timestamptz not null default now()
);
create index if not exists point_ledger_member_id_created_at_idx on public.point_ledger(member_id, created_at desc);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id text,
  actor_role text not null,
  action text not null,
  target_table text not null,
  target_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_target_idx on public.audit_logs(target_table, target_id);

alter table public.members enable row level security;
alter table public.member_identities enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.point_ledger enable row level security;
alter table public.audit_logs enable row level security;

-- 初版安全基線：不開放 anon/authenticated 角色直接操作資料表。
-- 前台只呼叫 Vercel Serverless API；Serverless API 使用 service role 並自行驗證 HttpOnly session。

drop policy if exists members_no_direct_select on public.members;
create policy members_no_direct_select on public.members for select to anon, authenticated using (false);
drop policy if exists members_no_direct_insert on public.members;
create policy members_no_direct_insert on public.members for insert to anon, authenticated with check (false);
drop policy if exists members_no_direct_update on public.members;
create policy members_no_direct_update on public.members for update to anon, authenticated using (false) with check (false);
drop policy if exists members_no_direct_delete on public.members;
create policy members_no_direct_delete on public.members for delete to anon, authenticated using (false);

drop policy if exists identities_no_direct_access on public.member_identities;
create policy identities_no_direct_access on public.member_identities for all to anon, authenticated using (false) with check (false);
drop policy if exists orders_no_direct_access on public.orders;
create policy orders_no_direct_access on public.orders for all to anon, authenticated using (false) with check (false);
drop policy if exists order_items_no_direct_access on public.order_items;
create policy order_items_no_direct_access on public.order_items for all to anon, authenticated using (false) with check (false);
drop policy if exists coupons_no_direct_access on public.coupons;
create policy coupons_no_direct_access on public.coupons for all to anon, authenticated using (false) with check (false);
drop policy if exists coupon_redemptions_no_direct_access on public.coupon_redemptions;
create policy coupon_redemptions_no_direct_access on public.coupon_redemptions for all to anon, authenticated using (false) with check (false);
drop policy if exists point_ledger_no_direct_access on public.point_ledger;
create policy point_ledger_no_direct_access on public.point_ledger for all to anon, authenticated using (false) with check (false);
drop policy if exists audit_logs_no_direct_access on public.audit_logs;
create policy audit_logs_no_direct_access on public.audit_logs for all to anon, authenticated using (false) with check (false);

create or replace view public.member_safe_profiles as
select
  id,
  case
    when display_name is null or length(display_name) = 0 then null
    when length(display_name) = 1 then display_name || '*'
    else left(display_name, 1) || repeat('*', greatest(length(display_name) - 1, 1))
  end as display_name_masked,
  case
    when phone is null or length(phone) < 6 then null
    else left(phone, 4) || repeat('*', greatest(length(phone) - 7, 0)) || right(phone, 3)
  end as phone_masked,
  case when birthday is null then null else to_char(birthday, 'MM-DD') end as birthday_month_day,
  preferred_taste,
  marketing_opt_in,
  points,
  tier,
  source,
  created_at,
  updated_at
from public.members;

revoke all on public.members from anon, authenticated;
revoke all on public.member_identities from anon, authenticated;
revoke all on public.orders from anon, authenticated;
revoke all on public.order_items from anon, authenticated;
revoke all on public.coupons from anon, authenticated;
revoke all on public.coupon_redemptions from anon, authenticated;
revoke all on public.point_ledger from anon, authenticated;
revoke all on public.audit_logs from anon, authenticated;
revoke all on public.member_safe_profiles from anon, authenticated;
