create table public.site_settings (
  id int primary key default 1 check (id = 1),
  shop_name text not null default '두암시장김치',
  tagline text not null default '',
  intro text not null default '',
  hero_image_url text,
  phone text not null default '',
  kakao_url text not null default '',
  instagram_url text not null default '',
  address text not null default '',
  bank_name text not null default '',
  account_number text not null default '',
  account_holder text not null default '',
  order_guide text not null default '',
  shipping_fee text not null default '',
  shipping_guide text not null default '',
  business_info text not null default '',
  updated_at timestamptz not null default now()
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  tag text not null default '',
  image_url text,
  options jsonb not null default '[]'::jsonb,
  is_soldout boolean not null default false,
  is_visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index menu_items_sort_idx on public.menu_items (sort_order, created_at);

alter table public.site_settings enable row level security;
alter table public.menu_items enable row level security;

create policy "public read settings" on public.site_settings for select to anon, authenticated using (true);
create policy "public read visible menu" on public.menu_items for select to anon, authenticated using (is_visible);

insert into storage.buckets (id, name, public) values ('images', 'images', true)
on conflict (id) do nothing;
