create extension if not exists pgcrypto;

create type public.family_role as enum ('owner', 'editor', 'viewer');
create type public.relationship_kind as enum ('parent_child', 'spouse', 'partner');
create type public.parent_kind as enum ('biological', 'adoptive', 'step', 'foster', 'legal', 'unknown');

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  created_by uuid not null references auth.users(id) on delete restrict,
  default_language text not null default 'hi' check (default_language in ('hi','en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.family_memberships (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.family_role not null default 'viewer',
  status text not null default 'active' check (status in ('active','revoked')),
  created_at timestamptz not null default now(),
  unique (family_id, user_id)
);

create table public.persons (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 160),
  native_name text,
  gender text check (gender is null or gender in ('male','female','other','unspecified')),
  birth_date date,
  birth_date_precision text not null default 'exact' check (birth_date_precision in ('exact','year','approximate','unknown')),
  death_date date,
  birth_place text,
  biography text,
  is_living boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (death_date is null or birth_date is null or death_date >= birth_date)
);

create table public.relationships (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  from_person_id uuid not null references public.persons(id) on delete cascade,
  to_person_id uuid not null references public.persons(id) on delete cascade,
  relationship_type public.relationship_kind not null,
  parent_role public.parent_kind,
  valid_from date,
  valid_to date,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (from_person_id <> to_person_id),
  check ((relationship_type = 'parent_child' and parent_role is not null) or (relationship_type <> 'parent_child' and parent_role is null)),
  check (valid_to is null or valid_from is null or valid_to >= valid_from),
  unique (family_id, from_person_id, to_person_id, relationship_type)
);

create index persons_family_idx on public.persons(family_id);
create index relationships_family_idx on public.relationships(family_id);
create index relationships_from_idx on public.relationships(from_person_id);
create index relationships_to_idx on public.relationships(to_person_id);
create index memberships_user_idx on public.family_memberships(user_id, status);

create function public.is_family_member(target_family uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.family_memberships m
    where m.family_id = target_family and m.user_id = (select auth.uid()) and m.status = 'active'
  );
$$;

create function public.has_family_role(target_family uuid, allowed_roles public.family_role[])
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.family_memberships m
    where m.family_id = target_family and m.user_id = (select auth.uid())
      and m.status = 'active' and m.role = any(allowed_roles)
  );
$$;

alter table public.families enable row level security;
alter table public.family_memberships enable row level security;
alter table public.persons enable row level security;
alter table public.relationships enable row level security;

create policy "family members can read families" on public.families for select to authenticated using (public.is_family_member(id));
create policy "authenticated users can create families" on public.families for insert to authenticated with check (created_by = (select auth.uid()));
create policy "owners can update families" on public.families for update to authenticated using (public.has_family_role(id, array['owner']::public.family_role[])) with check (public.has_family_role(id, array['owner']::public.family_role[]));
create policy "owners can delete families" on public.families for delete to authenticated using (public.has_family_role(id, array['owner']::public.family_role[]));

create policy "members can read memberships" on public.family_memberships for select to authenticated using (public.is_family_member(family_id));
create policy "owners can add memberships" on public.family_memberships for insert to authenticated with check (public.has_family_role(family_id, array['owner']::public.family_role[]));
create policy "owners can update memberships" on public.family_memberships for update to authenticated using (public.has_family_role(family_id, array['owner']::public.family_role[])) with check (public.has_family_role(family_id, array['owner']::public.family_role[]));
create policy "owners can remove memberships" on public.family_memberships for delete to authenticated using (public.has_family_role(family_id, array['owner']::public.family_role[]));

create policy "members can read persons" on public.persons for select to authenticated using (public.is_family_member(family_id));
create policy "editors can add persons" on public.persons for insert to authenticated with check (public.has_family_role(family_id, array['owner','editor']::public.family_role[]) and (created_by is null or created_by = (select auth.uid())));
create policy "editors can update persons" on public.persons for update to authenticated using (public.has_family_role(family_id, array['owner','editor']::public.family_role[])) with check (public.has_family_role(family_id, array['owner','editor']::public.family_role[]));
create policy "editors can delete persons" on public.persons for delete to authenticated using (public.has_family_role(family_id, array['owner','editor']::public.family_role[]));

create policy "members can read relationships" on public.relationships for select to authenticated using (public.is_family_member(family_id));
create policy "editors can add relationships" on public.relationships for insert to authenticated with check (
  public.has_family_role(family_id, array['owner','editor']::public.family_role[])
  and exists (select 1 from public.persons p where p.id = from_person_id and p.family_id = relationships.family_id)
  and exists (select 1 from public.persons p where p.id = to_person_id and p.family_id = relationships.family_id)
);
create policy "editors can update relationships" on public.relationships for update to authenticated using (public.has_family_role(family_id, array['owner','editor']::public.family_role[])) with check (
  public.has_family_role(family_id, array['owner','editor']::public.family_role[])
  and exists (select 1 from public.persons p where p.id = from_person_id and p.family_id = relationships.family_id)
  and exists (select 1 from public.persons p where p.id = to_person_id and p.family_id = relationships.family_id)
);
create policy "editors can delete relationships" on public.relationships for delete to authenticated using (public.has_family_role(family_id, array['owner','editor']::public.family_role[]));

create function public.bootstrap_family(p_name text, p_language text default 'hi')
returns uuid language plpgsql security definer set search_path = '' as $$
declare new_family_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if char_length(trim(p_name)) not between 1 and 120 then raise exception 'Family name must be between 1 and 120 characters'; end if;
  if p_language not in ('hi','en') then raise exception 'Unsupported language'; end if;
  insert into public.families(name, created_by, default_language) values (trim(p_name), auth.uid(), p_language) returning id into new_family_id;
  insert into public.family_memberships(family_id, user_id, role) values (new_family_id, auth.uid(), 'owner');
  return new_family_id;
end;
$$;
revoke all on function public.bootstrap_family(text,text) from public;
grant execute on function public.bootstrap_family(text,text) to authenticated;
