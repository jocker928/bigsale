-- BIGSALE database setup. Run this in Supabase SQL Editor.
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text,
 role text not null default 'customer' check(role in ('customer','staff','super_admin')),
 created_at timestamptz not null default now()
);
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path=public as $$
begin
 insert into public.profiles(id,full_name) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''));
 return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.products(
 id bigint generated always as identity primary key,
 name text not null, description text, category text,
 price numeric(10,2) not null check(price>=0),
 offer_price numeric(10,2) check(offer_price is null or (offer_price>=0 and offer_price<=price)),
 stock integer not null default 0 check(stock>=0),
 sizes text[] not null default '{}', colours text[] not null default '{}',
 image_url text, active boolean not null default true,
 created_at timestamptz not null default now()
);
alter table public.products add column if not exists category text;
create table if not exists public.orders(
 id bigint generated always as identity primary key,
 customer_id uuid not null references auth.users(id),
 total numeric(10,2) not null default 0,
 status text not null default 'pending' check(status in ('pending','confirmed','shipped','delivered','cancelled')),
 created_at timestamptz not null default now()
);
create table if not exists public.order_items(
 id bigint generated always as identity primary key,
 order_id bigint not null references public.orders(id) on delete cascade,
 product_id bigint references public.products(id),
 quantity integer not null check(quantity>0),
 price numeric(10,2) not null check(price>=0)
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.profiles where id=auth.uid() and role in ('staff','super_admin'));
$$;
create or replace function public.is_super_admin() returns boolean
language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.profiles where id=auth.uid() and role='super_admin');
$$;
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
drop policy if exists "profiles read self or admin" on public.profiles;
create policy "profiles read self or admin" on public.profiles for select to authenticated using(id=auth.uid() or public.is_admin());
drop policy if exists "admins manage products" on public.products;
create policy "admins manage products" on public.products for all to authenticated using(public.is_admin()) with check(public.is_admin());
drop policy if exists "public view active products" on public.products;
create policy "public view active products" on public.products for select to anon,authenticated using(active=true);
drop policy if exists "customers read own orders or admins all" on public.orders;
create policy "customers read own orders or admins all" on public.orders for select to authenticated using(customer_id=auth.uid() or public.is_admin());
drop policy if exists "customers create own orders" on public.orders;
create policy "customers create own orders" on public.orders for insert to authenticated with check(customer_id=auth.uid());
drop policy if exists "admins update orders" on public.orders;
create policy "admins update orders" on public.orders for update to authenticated using(public.is_admin()) with check(public.is_admin());
drop policy if exists "read order items own or admin" on public.order_items;
create policy "read order items own or admin" on public.order_items for select to authenticated using(public.is_admin() or exists(select 1 from public.orders o where o.id=order_id and o.customer_id=auth.uid()));
drop policy if exists "admins manage order items" on public.order_items;
create policy "admins manage order items" on public.order_items for all to authenticated using(public.is_admin()) with check(public.is_admin());

-- Only a Super Admin can promote an already-registered account to Staff.
create or replace function public.promote_user_to_staff(user_email text)
returns text language plpgsql security definer set search_path=public,auth as $$
begin
 if not public.is_super_admin() then raise exception 'Only Super Admin can add staff.'; end if;
 update public.profiles p set role='staff'
 from auth.users u where p.id=u.id and lower(u.email)=lower(user_email) and p.role='customer';
 if not found then return 'No matching customer account found, or account is already an admin.'; end if;
 return 'Staff admin added successfully.';
end; $$;
revoke all on function public.promote_user_to_staff(text) from public;
grant execute on function public.promote_user_to_staff(text) to authenticated;

-- Product images bucket and policies.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
drop policy if exists "public read product images" on storage.objects;
create policy "public read product images" on storage.objects for select using(bucket_id='product-images');
drop policy if exists "admins upload product images" on storage.objects;
create policy "admins upload product images" on storage.objects for insert to authenticated with check(bucket_id='product-images' and public.is_admin());
drop policy if exists "admins update product images" on storage.objects;
create policy "admins update product images" on storage.objects for update to authenticated using(bucket_id='product-images' and public.is_admin()) with check(bucket_id='product-images' and public.is_admin());
drop policy if exists "admins delete product images" on storage.objects;
create policy "admins delete product images" on storage.objects for delete to authenticated using(bucket_id='product-images' and public.is_admin());

-- IMPORTANT: After signing up with your own account, run this once to make yourself Super Admin:
-- update public.profiles set role='super_admin' where id=(select id from auth.users where email='YOUR_EMAIL_HERE');
