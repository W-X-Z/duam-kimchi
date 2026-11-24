alter table public.site_settings
  add column shipping_fee_amount int not null default 4000,
  add column free_shipping_over int;

alter table public.menu_items
  add column detail text not null default '';

create sequence public.order_seq;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique default (to_char(now() at time zone 'Asia/Seoul', 'YYMMDD') || '-' || lpad(nextval('public.order_seq')::text, 4, '0')),
  customer_name text not null,
  phone text not null,
  depositor_name text not null,
  zipcode text not null default '',
  address text not null,
  address_detail text not null default '',
  memo text not null default '',
  items jsonb not null,
  items_total int not null,
  shipping_fee int not null,
  total int not null,
  status text not null default 'pending' check (status in ('pending','paid','shipped','cancelled')),
  tracking_no text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_created_idx on public.orders (created_at desc);
alter table public.orders enable row level security;
-- no public policies: orders are read/written only by the server with the secret key
