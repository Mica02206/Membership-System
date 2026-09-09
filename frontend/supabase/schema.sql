create table if not exists public.members (
  id text primary key,
  member_id text unique not null,
  full_name text not null,
  contact text not null,
  address text not null,
  picture_url text,
  package_name text not null,
  package_days integer not null check (package_days > 0),
  started_at timestamptz not null,
  registered_at timestamptz not null default now()
);

create table if not exists public.member_activity (
  member_id text primary key references public.members(member_id) on delete cascade,
  action text not null check (action in ('check-in', 'check-out')),
  station text not null,
  occurred_at timestamptz not null default now()
);

alter table public.members enable row level security;
alter table public.member_activity enable row level security;

create index if not exists idx_members_member_id on public.members(member_id);

insert into storage.buckets (id, name, public)
values ('member-photos', 'member-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "staff can view members" on public.members;
create policy "staff can view members"
on public.members for select to authenticated using (true);

drop policy if exists "staff can create members" on public.members;
create policy "staff can create members"
on public.members for insert to authenticated with check (true);

drop policy if exists "staff can edit members" on public.members;
create policy "staff can edit members"
on public.members for update to authenticated using (true) with check (true);

drop policy if exists "staff can delete members" on public.members;
create policy "staff can delete members"
on public.members for delete to authenticated using (true);

drop policy if exists "staff can view activity" on public.member_activity;
create policy "staff can view activity"
on public.member_activity for select to authenticated using (true);

drop policy if exists "staff can record activity" on public.member_activity;
create policy "staff can record activity"
on public.member_activity for insert to authenticated with check (true);

drop policy if exists "staff can edit activity" on public.member_activity;
create policy "staff can edit activity"
on public.member_activity for update to authenticated using (true) with check (true);

drop policy if exists "staff can upload member photos" on storage.objects;
create policy "staff can upload member photos"
on storage.objects for insert to authenticated
with check (bucket_id = 'member-photos');

drop policy if exists "staff can update member photos" on storage.objects;
create policy "staff can update member photos"
on storage.objects for update to authenticated
using (bucket_id = 'member-photos')
with check (bucket_id = 'member-photos');

drop policy if exists "staff can delete member photos" on storage.objects;
create policy "staff can delete member photos"
on storage.objects for delete to authenticated
using (bucket_id = 'member-photos');
