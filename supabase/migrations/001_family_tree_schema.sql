-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Profiles table
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  first_name text not null,
  last_name text not null,
  birth_year int,
  birth_year_approximate boolean not null default false,
  death_year int,
  bio text check (char_length(bio) <= 280),
  photo_url text,
  created_by uuid references auth.users(id) not null,
  submission_batch_id uuid not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Profile claims table
create table profile_claims (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) not null,
  claimant_id uuid references auth.users(id) not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint one_active_claim_per_profile unique (profile_id)
);

-- Relationships table
create table relationships (
  id uuid primary key default uuid_generate_v4(),
  person_a_id uuid references profiles(id) not null,
  person_b_id uuid references profiles(id) not null,
  relationship_type text not null check (relationship_type in ('parent_child', 'spouse')),
  subtype text check (subtype in ('biological', 'adoptive', 'step', 'foster') or subtype is null),
  start_year int,
  end_year int,
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  submission_batch_id uuid not null,
  created_by uuid references auth.users(id) not null,
  created_at timestamptz not null default now()
);

-- Private fields table
create table private_fields (
  profile_id uuid primary key references profiles(id),
  location text,
  contact_info text
);

-- Admin users table
create table admin_users (
  user_id uuid primary key references auth.users(id)
);

-- Index for common queries
create index idx_profiles_status on profiles(status);
create index idx_profiles_created_by on profiles(created_by);
create index idx_profiles_batch on profiles(submission_batch_id);
create index idx_relationships_person_a on relationships(person_a_id);
create index idx_relationships_person_b on relationships(person_b_id);
create index idx_relationships_status on relationships(status);
create index idx_profile_claims_claimant on profile_claims(claimant_id);
create index idx_profile_claims_profile on profile_claims(profile_id);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- Helper function: is current user an admin?
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from admin_users where user_id = auth.uid()
  );
$$ language plpgsql security definer;

-- Helper function: is current user approved (has an approved claim)?
create or replace function is_approved_user()
returns boolean as $$
  select exists (
    select 1 from profile_claims
    where claimant_id = auth.uid() and status = 'approved'
  );
$$ language plpgsql security definer;

-- RLS: Enable on all tables
alter table profiles enable row level security;
alter table profile_claims enable row level security;
alter table relationships enable row level security;
alter table private_fields enable row level security;
alter table admin_users enable row level security;

-- RLS: profiles
create policy "Approved users can read approved profiles"
  on profiles for select using (
    (status = 'approved' and is_approved_user())
    or (created_by = auth.uid())
    or is_admin()
  );

create policy "Authenticated users can insert pending profiles"
  on profiles for insert with check (
    auth.uid() is not null and status = 'pending'
  );

create policy "Admin can update profiles"
  on profiles for update using (is_admin());

-- RLS: profile_claims
create policy "Users can read own claims, admin reads all"
  on profile_claims for select using (
    claimant_id = auth.uid() or is_admin()
  );

create policy "Authenticated users can insert claims on approved profiles"
  on profile_claims for insert with check (
    auth.uid() is not null
    and exists (
      select 1 from profiles where id = profile_id and status = 'approved'
    )
  );

create policy "Admin can update claims"
  on profile_claims for update using (is_admin());

-- RLS: relationships
create policy "Approved users can read approved relationships"
  on relationships for select using (
    (status = 'approved' and is_approved_user())
    or (created_by = auth.uid())
    or is_admin()
  );

create policy "Authenticated users can insert pending relationships"
  on relationships for insert with check (
    auth.uid() is not null and status = 'pending'
  );

create policy "Admin can update relationships"
  on relationships for update using (is_admin());

-- RLS: private_fields
create policy "Claimant or admin can read private fields"
  on private_fields for select using (
    exists (
      select 1 from profile_claims
      where profile_claims.profile_id = private_fields.profile_id
        and profile_claims.claimant_id = auth.uid()
        and profile_claims.status = 'approved'
    )
    or is_admin()
  );

create policy "Authenticated users can insert private fields"
  on private_fields for insert with check (auth.uid() is not null);

create policy "Admin can update private fields"
  on private_fields for update using (is_admin());

-- RLS: admin_users
create policy "Admin can read admin_users"
  on admin_users for select using (is_admin());
