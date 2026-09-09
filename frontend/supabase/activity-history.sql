-- Run this once in Supabase SQL Editor for multiple check-in/check-out records.
alter table public.member_activity add column if not exists id uuid default gen_random_uuid();
update public.member_activity set id = gen_random_uuid() where id is null;
alter table public.member_activity alter column id set not null;
alter table public.member_activity drop constraint if exists member_activity_pkey;
alter table public.member_activity add constraint member_activity_pkey primary key (id);
