# Family Tree Explorer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a password-protected, interactive family tree explorer at `/family` on the adebalogun personal website, with magic link auth, zoomable tree visualization, member submission flow, and admin dashboard.

**Architecture:** React frontend communicates directly with Supabase (Postgres + Auth + Storage). Tree visualization uses React Flow with elkjs layout engine. All access gated by magic link auth + admin-approved profiles with a claims system.

**Tech Stack:** React 18, TypeScript, MUI v5, React Router v6, Supabase (`@supabase/supabase-js`), React Flow (`@xyflow/react`), elkjs

---

## Task 1: Install Dependencies & Configure Supabase Client

**Files:**
- Modify: `package.json`
- Modify: `.env.example`
- Create: `.env` (add new vars — do NOT commit)
- Create: `src/views/family/supabaseClient.ts`

- [ ] **Step 1: Install new dependencies**

Run:
```bash
cd /Users/adekunlebalogun/Projects/adebalogun
yarn add @supabase/supabase-js @xyflow/react elkjs
yarn add @types/elkjs --dev
```

- [ ] **Step 2: Add env vars to `.env.example`**

Append to `.env.example`:
```
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

- [ ] **Step 3: Add actual env vars to `.env`**

The user must provide their Supabase project URL and anon key. Add to `.env`:
```
REACT_APP_SUPABASE_URL=<actual url>
REACT_APP_SUPABASE_ANON_KEY=<actual key>
```

- [ ] **Step 4: Create Supabase client**

Create `src/views/family/supabaseClient.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 5: Verify build still works**

Run: `yarn build`
Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add package.json yarn.lock .env.example src/views/family/supabaseClient.ts
git commit -m "feat(family): install supabase, react-flow, elkjs dependencies and configure client"
```

---

## Task 2: Supabase Database Schema (SQL Migration)

**Files:**
- Create: `supabase/migrations/001_family_tree_schema.sql`

This SQL will be run manually in the Supabase dashboard SQL editor or via the Supabase CLI.

- [ ] **Step 1: Create the migration file**

Create `supabase/migrations/001_family_tree_schema.sql`:

```sql
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
```

- [ ] **Step 2: Commit the migration file**

```bash
git add supabase/migrations/001_family_tree_schema.sql
git commit -m "feat(family): add database schema migration with RLS policies"
```

> **Note to implementer**: This migration must be run in the Supabase SQL editor or via `supabase db push`. After running, the user needs to:
> 1. Insert themselves into `admin_users` with their auth user ID
> 2. Seed their own profile and claim (see Task 11 bootstrapping section)
> 3. Configure Auth redirect URL in Supabase dashboard
> 4. Create a `photos` storage bucket with public read access

---

## Task 3: TypeScript Types

**Files:**
- Create: `src/views/family/types.ts`

- [ ] **Step 1: Create the shared types file**

Create `src/views/family/types.ts`:

```typescript
export type ProfileStatus = 'pending' | 'approved' | 'denied';
export type ClaimStatus = 'pending' | 'approved' | 'denied';
export type RelationshipType = 'parent_child' | 'spouse';
export type RelationshipSubtype = 'biological' | 'adoptive' | 'step' | 'foster';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  birth_year: number | null;
  birth_year_approximate: boolean;
  death_year: number | null;
  bio: string | null;
  photo_url: string | null;
  created_by: string;
  submission_batch_id: string;
  status: ProfileStatus;
  created_at: string;
  updated_at: string;
}

export interface ProfileClaim {
  id: string;
  profile_id: string;
  claimant_id: string;
  status: ClaimStatus;
  created_at: string;
  resolved_at: string | null;
}

export interface Relationship {
  id: string;
  person_a_id: string;
  person_b_id: string;
  relationship_type: RelationshipType;
  subtype: RelationshipSubtype | null;
  start_year: number | null;
  end_year: number | null;
  status: ProfileStatus;
  submission_batch_id: string;
  created_by: string;
  created_at: string;
}

export interface PrivateFields {
  profile_id: string;
  location: string | null;
  contact_info: string | null;
}

export interface ProfileWithClaim extends Profile {
  claim?: ProfileClaim;
}

export type AccessState =
  | { type: 'unauthenticated' }
  | { type: 'new_user' }
  | { type: 'pending' }
  | { type: 'approved'; profileId: string }
  | { type: 'denied' };
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `yarn build`
Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/views/family/types.ts
git commit -m "feat(family): add shared TypeScript types for family tree data model"
```

---

## Task 4: Auth Hook & Auth Callback

**Files:**
- Create: `src/views/family/hooks/useAuth.ts`
- Create: `src/views/family/auth/AuthCallback.tsx`

- [ ] **Step 1: Create the auth hook**

Create `src/views/family/hooks/useAuth.ts`:

```typescript
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { AccessState, ProfileClaim } from '../types';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [accessState, setAccessState] = useState<AccessState>({ type: 'unauthenticated' });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setAccessState({ type: 'unauthenticated' });
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const checkAccess = async () => {
      setLoading(true);

      const { data: adminRow } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', session.user.id)
        .maybeSingle();
      setIsAdmin(!!adminRow);

      const { data: claims } = await supabase
        .from('profile_claims')
        .select('*')
        .eq('claimant_id', session.user.id);

      if (!claims || claims.length === 0) {
        const { data: ownProfiles } = await supabase
          .from('profiles')
          .select('status')
          .eq('created_by', session.user.id);

        if (ownProfiles && ownProfiles.length > 0) {
          const hasPending = ownProfiles.some(p => p.status === 'pending');
          const hasDenied = ownProfiles.some(p => p.status === 'denied');
          if (hasPending) {
            setAccessState({ type: 'pending' });
          } else if (hasDenied) {
            setAccessState({ type: 'denied' });
          } else {
            setAccessState({ type: 'new_user' });
          }
        } else {
          setAccessState({ type: 'new_user' });
        }
      } else {
        const approvedClaim = (claims as ProfileClaim[]).find(c => c.status === 'approved');
        const pendingClaim = (claims as ProfileClaim[]).find(c => c.status === 'pending');
        if (approvedClaim) {
          setAccessState({ type: 'approved', profileId: approvedClaim.profile_id });
        } else if (pendingClaim) {
          setAccessState({ type: 'pending' });
        } else {
          setAccessState({ type: 'denied' });
        }
      }

      setLoading(false);
    };

    checkAccess();
  }, [session]);

  const sendMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/family/auth/callback`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { session, accessState, loading, isAdmin, sendMagicLink, signOut };
}
```

- [ ] **Step 2: Create the auth callback component**

Create `src/views/family/auth/AuthCallback.tsx`:

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { supabase } from '../supabaseClient';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        navigate('/family', { replace: true });
      }
    });
  }, [navigate]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Signing you in...</Typography>
    </Box>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `yarn build`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/views/family/hooks/useAuth.ts src/views/family/auth/AuthCallback.tsx
git commit -m "feat(family): add auth hook with access state resolution and magic link callback"
```

---

## Task 5: Login Page

**Files:**
- Create: `src/views/family/auth/LoginPage.tsx`

- [ ] **Step 1: Create login page**

Create `src/views/family/auth/LoginPage.tsx`:

```typescript
import { useState } from 'react';
import {
  Container, Box, Typography, TextField, Button, Alert, Paper,
} from '@mui/material';

interface LoginPageProps {
  onSendMagicLink: (email: string) => Promise<{ error: Error | null }>;
}

export function LoginPage({ onSendMagicLink }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error } = await onSendMagicLink(email);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setSubmitting(false);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h3" gutterBottom>
          Family Tree
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          Enter your email to receive a sign-in link.
        </Typography>

        {sent ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Check your email
            </Typography>
            <Typography color="text.secondary">
              We sent a sign-in link to <strong>{email}</strong>. Click the link to continue.
            </Typography>
          </Paper>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 400 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
              fullWidth
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={submitting}
              size="large"
            >
              {submitting ? 'Sending...' : 'Send sign-in link'}
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/views/family/auth/LoginPage.tsx
git commit -m "feat(family): add magic link login page"
```

---

## Task 6: Pending & Denied Pages

**Files:**
- Create: `src/views/family/auth/PendingPage.tsx`

- [ ] **Step 1: Create pending/denied state pages**

Create `src/views/family/auth/PendingPage.tsx`:

```typescript
import { Container, Box, Typography, Button } from '@mui/material';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import BlockIcon from '@mui/icons-material/Block';

interface PendingPageProps {
  state: 'pending' | 'denied';
  onSignOut: () => void;
}

export function PendingPage({ state, onSignOut }: PendingPageProps) {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {state === 'pending' ? (
          <>
            <HourglassEmptyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Waiting for Approval
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              Your submission has been received. You'll get access once the admin approves your profile.
            </Typography>
          </>
        ) : (
          <>
            <BlockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Request Denied
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              Your request was not approved. If you think this is a mistake, please contact the family tree admin.
            </Typography>
          </>
        )}
        <Button variant="outlined" onClick={onSignOut}>
          Sign out
        </Button>
      </Box>
    </Container>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/views/family/auth/PendingPage.tsx
git commit -m "feat(family): add pending and denied access state pages"
```

---

## Task 7: Submission Flow — Profile Form & Relationship Picker

**Files:**
- Create: `src/views/family/submission/ProfileForm.tsx`
- Create: `src/views/family/submission/RelationshipPicker.tsx`
- Create: `src/views/family/submission/SubmissionFlow.tsx`
- Create: `src/views/family/hooks/useSubmission.ts`

- [ ] **Step 1: Create the profile form component**

Create `src/views/family/submission/ProfileForm.tsx`:

```typescript
import { useState } from 'react';
import {
  Box, TextField, Button, Typography, Checkbox, FormControlLabel, Alert,
} from '@mui/material';

export interface ProfileFormData {
  first_name: string;
  last_name: string;
  birth_year: number | null;
  birth_year_approximate: boolean;
  death_year: number | null;
  bio: string;
  location: string;
  contact_info: string;
  photo: File | null;
}

interface ProfileFormProps {
  onSubmit: (data: ProfileFormData) => void;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
}

export function ProfileForm({ onSubmit, onBack, title, subtitle }: ProfileFormProps) {
  const [form, setForm] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    birth_year: null,
    birth_year_approximate: false,
    death_year: null,
    bio: '',
    location: '',
    contact_info: '',
    photo: null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" gutterBottom>
        {title || 'Tell us about yourself'}
      </Typography>
      {subtitle && (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {subtitle}
        </Typography>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="First name"
          value={form.first_name}
          onChange={(e) => setForm(f => ({ ...f, first_name: e.target.value }))}
          required
          fullWidth
        />
        <TextField
          label="Last name"
          value={form.last_name}
          onChange={(e) => setForm(f => ({ ...f, last_name: e.target.value }))}
          required
          fullWidth
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <TextField
          label="Birth year"
          type="number"
          value={form.birth_year ?? ''}
          onChange={(e) => setForm(f => ({ ...f, birth_year: e.target.value ? parseInt(e.target.value) : null }))}
          sx={{ width: 140 }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={form.birth_year_approximate}
              onChange={(e) => setForm(f => ({ ...f, birth_year_approximate: e.target.checked }))}
            />
          }
          label="Approximate"
        />
        <TextField
          label="Death year"
          type="number"
          value={form.death_year ?? ''}
          onChange={(e) => setForm(f => ({ ...f, death_year: e.target.value ? parseInt(e.target.value) : null }))}
          sx={{ width: 140 }}
        />
      </Box>

      <TextField
        label="Short bio"
        value={form.bio}
        onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
        multiline
        rows={2}
        fullWidth
        inputProps={{ maxLength: 280 }}
        helperText={`${form.bio.length}/280`}
        sx={{ mb: 2 }}
      />

      <Alert severity="info" sx={{ mb: 2 }}>
        Location and contact info are <strong>private</strong> — only you and the admin can see them. Other family members can request access.
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Location (private)"
          value={form.location}
          onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
          fullWidth
        />
        <TextField
          label="Contact info (private)"
          value={form.contact_info}
          onChange={(e) => setForm(f => ({ ...f, contact_info: e.target.value }))}
          fullWidth
        />
      </Box>

      <Button variant="outlined" component="label" sx={{ mb: 3 }}>
        Upload photo
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => setForm(f => ({ ...f, photo: e.target.files?.[0] || null }))}
        />
      </Button>
      {form.photo && (
        <Typography variant="body2" color="text.secondary" sx={{ ml: 2, display: 'inline' }}>
          {form.photo.name}
        </Typography>
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        {onBack && (
          <Button variant="outlined" onClick={onBack}>Back</Button>
        )}
        <Button type="submit" variant="contained" fullWidth>
          Next
        </Button>
      </Box>
    </Box>
  );
}
```

- [ ] **Step 2: Create the relationship picker component**

Create `src/views/family/submission/RelationshipPicker.tsx`:

```typescript
import { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Autocomplete, FormControl, InputLabel,
  Select, MenuItem, Button, SelectChangeEvent,
} from '@mui/material';
import { Profile, RelationshipSubtype } from '../types';
import { supabase } from '../supabaseClient';

interface PendingPerson {
  tempId: string;
  first_name: string;
  last_name: string;
}

export interface RelationshipFormData {
  relatedToId: string;
  relationshipLabel: 'child_of' | 'parent_of' | 'spouse_of';
  subtype: RelationshipSubtype | null;
  startYear: number | null;
  endYear: number | null;
}

interface RelationshipPickerProps {
  onSubmit: (data: RelationshipFormData) => void;
  onBack: () => void;
  pendingPeople?: PendingPerson[];
  subjectName?: string;
}

export function RelationshipPicker({ onSubmit, onBack, pendingPeople = [], subjectName }: RelationshipPickerProps) {
  const [approvedProfiles, setApprovedProfiles] = useState<Profile[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<{ id: string; label: string } | null>(null);
  const [relationshipLabel, setRelationshipLabel] = useState<RelationshipFormData['relationshipLabel']>('child_of');
  const [subtype, setSubtype] = useState<RelationshipSubtype | null>(null);
  const [startYear, setStartYear] = useState<number | null>(null);
  const [endYear, setEndYear] = useState<number | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'approved')
        .order('last_name');
      if (data) setApprovedProfiles(data);
    };
    fetchProfiles();
  }, []);

  const allOptions = [
    ...approvedProfiles.map(p => ({
      id: p.id,
      label: `${p.first_name} ${p.last_name}`,
    })),
    ...pendingPeople.map(p => ({
      id: p.tempId,
      label: `${p.first_name} ${p.last_name} (pending)`,
    })),
  ];

  const prefix = subjectName ? `${subjectName} is the` : 'I am the';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerson) return;
    onSubmit({
      relatedToId: selectedPerson.id,
      relationshipLabel,
      subtype,
      startYear,
      endYear,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" gutterBottom>
        How are you related?
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Select a person on the tree and your relationship to them.
      </Typography>

      <Autocomplete
        options={allOptions}
        getOptionLabel={(o) => o.label}
        value={selectedPerson}
        onChange={(_, v) => setSelectedPerson(v)}
        renderInput={(params) => (
          <TextField {...params} label="Related to..." required />
        )}
        sx={{ mb: 2 }}
        isOptionEqualToValue={(o, v) => o.id === v.id}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Relationship</InputLabel>
        <Select
          value={relationshipLabel}
          label="Relationship"
          onChange={(e: SelectChangeEvent) => setRelationshipLabel(e.target.value as RelationshipFormData['relationshipLabel'])}
        >
          <MenuItem value="child_of">{prefix} child of this person</MenuItem>
          <MenuItem value="parent_of">{prefix} parent of this person</MenuItem>
          <MenuItem value="spouse_of">{prefix} spouse of this person</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Type (optional)</InputLabel>
        <Select
          value={subtype || ''}
          label="Type (optional)"
          onChange={(e: SelectChangeEvent) => setSubtype((e.target.value || null) as RelationshipSubtype | null)}
        >
          <MenuItem value="">None</MenuItem>
          <MenuItem value="biological">Biological</MenuItem>
          <MenuItem value="adoptive">Adoptive</MenuItem>
          <MenuItem value="step">Step</MenuItem>
          <MenuItem value="foster">Foster</MenuItem>
        </Select>
      </FormControl>

      {relationshipLabel === 'spouse_of' && (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Marriage year"
            type="number"
            value={startYear ?? ''}
            onChange={(e) => setStartYear(e.target.value ? parseInt(e.target.value) : null)}
            sx={{ width: 160 }}
          />
          <TextField
            label="End year (if divorced)"
            type="number"
            value={endYear ?? ''}
            onChange={(e) => setEndYear(e.target.value ? parseInt(e.target.value) : null)}
            sx={{ width: 200 }}
          />
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button variant="outlined" onClick={onBack}>Back</Button>
        <Button type="submit" variant="contained" fullWidth disabled={!selectedPerson}>
          Submit
        </Button>
      </Box>
    </Box>
  );
}
```

- [ ] **Step 3: Create the submission hook**

Create `src/views/family/hooks/useSubmission.ts`:

```typescript
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../supabaseClient';
import { ProfileFormData } from '../submission/ProfileForm';
import { RelationshipFormData } from '../submission/RelationshipPicker';
import { RelationshipType } from '../types';

interface PendingSubmission {
  tempId: string;
  profileData: ProfileFormData;
  relationship: RelationshipFormData;
}

export function useSubmission() {
  const [batchId] = useState(() => uuidv4());
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitProfile = async (
    profileData: ProfileFormData,
    relationship: RelationshipFormData,
    isSelf: boolean
  ) => {
    setSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let photoUrl: string | null = null;
      if (profileData.photo) {
        const ext = profileData.photo.name.split('.').pop();
        const path = `${user.id}/${uuidv4()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(path, profileData.photo);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(path);
        photoUrl = publicUrl;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          birth_year: profileData.birth_year,
          birth_year_approximate: profileData.birth_year_approximate,
          death_year: profileData.death_year,
          bio: profileData.bio || null,
          photo_url: photoUrl,
          created_by: user.id,
          submission_batch_id: batchId,
          status: 'pending',
        })
        .select()
        .single();

      if (profileError) throw profileError;

      if (profileData.location || profileData.contact_info) {
        await supabase.from('private_fields').insert({
          profile_id: profile.id,
          location: profileData.location || null,
          contact_info: profileData.contact_info || null,
        });
      }

      const { personAId, personBId, relType } = resolveRelationship(
        profile.id,
        relationship.relatedToId,
        relationship.relationshipLabel
      );

      await supabase.from('relationships').insert({
        person_a_id: personAId,
        person_b_id: personBId,
        relationship_type: relType,
        subtype: relationship.subtype,
        start_year: relationship.startYear,
        end_year: relationship.endYear,
        status: 'pending',
        submission_batch_id: batchId,
        created_by: user.id,
      });

      if (isSelf) {
        await supabase.from('profile_claims').insert({
          profile_id: profile.id,
          claimant_id: user.id,
          status: 'pending',
        });
      }

      const tempId = profile.id;
      setPendingSubmissions(prev => [
        ...prev,
        { tempId, profileData, relationship },
      ]);

      return profile.id;
    } catch (err: any) {
      setError(err.message || 'Submission failed');
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    batchId,
    pendingSubmissions,
    submitting,
    error,
    submitProfile,
  };
}

function resolveRelationship(
  newProfileId: string,
  relatedToId: string,
  label: 'child_of' | 'parent_of' | 'spouse_of'
): { personAId: string; personBId: string; relType: RelationshipType } {
  switch (label) {
    case 'child_of':
      return { personAId: relatedToId, personBId: newProfileId, relType: 'parent_child' };
    case 'parent_of':
      return { personAId: newProfileId, personBId: relatedToId, relType: 'parent_child' };
    case 'spouse_of':
      return {
        personAId: newProfileId < relatedToId ? newProfileId : relatedToId,
        personBId: newProfileId < relatedToId ? relatedToId : newProfileId,
        relType: 'spouse',
      };
  }
}
```

- [ ] **Step 4: Create the submission flow component**

Create `src/views/family/submission/SubmissionFlow.tsx`:

```typescript
import { useState } from 'react';
import { Container, Box, Typography, Button, Paper, Divider } from '@mui/material';
import { ProfileForm, ProfileFormData } from './ProfileForm';
import { RelationshipPicker, RelationshipFormData } from './RelationshipPicker';
import { useSubmission } from '../hooks/useSubmission';

interface SubmissionFlowProps {
  isSelf: boolean;
  onComplete: () => void;
}

export function SubmissionFlow({ isSelf, onComplete }: SubmissionFlowProps) {
  const [step, setStep] = useState<'profile' | 'relationship' | 'done'>('profile');
  const [profileData, setProfileData] = useState<ProfileFormData | null>(null);
  const { pendingSubmissions, submitting, error, submitProfile } = useSubmission();

  const handleProfileSubmit = (data: ProfileFormData) => {
    setProfileData(data);
    setStep('relationship');
  };

  const handleRelationshipSubmit = async (rel: RelationshipFormData) => {
    if (!profileData) return;
    const id = await submitProfile(profileData, rel, isSelf && pendingSubmissions.length === 0);
    if (id) {
      setStep('done');
    }
  };

  const handleAddAnother = () => {
    setProfileData(null);
    setStep('profile');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        )}

        {step === 'profile' && (
          <ProfileForm
            onSubmit={handleProfileSubmit}
            title={isSelf && pendingSubmissions.length === 0
              ? 'Tell us about yourself'
              : 'Add a family member'}
            subtitle={isSelf && pendingSubmissions.length === 0
              ? 'To explore the family tree, we need to know who you are.'
              : undefined}
          />
        )}

        {step === 'relationship' && (
          <RelationshipPicker
            onSubmit={handleRelationshipSubmit}
            onBack={() => setStep('profile')}
            pendingPeople={pendingSubmissions.map(s => ({
              tempId: s.tempId,
              first_name: s.profileData.first_name,
              last_name: s.profileData.last_name,
            }))}
            subjectName={
              isSelf && pendingSubmissions.length === 0
                ? undefined
                : profileData ? `${profileData.first_name} ${profileData.last_name}` : undefined
            }
          />
        )}

        {step === 'done' && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              {isSelf && pendingSubmissions.length === 1
                ? 'Submission received!'
                : 'Person added!'}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {isSelf && pendingSubmissions.length === 1
                ? "You'll get access once the admin approves your profile."
                : `${profileData?.first_name} has been submitted for approval.`}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="outlined" onClick={handleAddAnother}>
                Add another family member
              </Button>
              <Button variant="contained" onClick={onComplete}>
                Done
              </Button>
            </Box>
          </Paper>
        )}

        {submitting && (
          <Typography color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Submitting...
          </Typography>
        )}
      </Box>
    </Container>
  );
}
```

- [ ] **Step 5: Install uuid dependency**

Run: `yarn add uuid && yarn add @types/uuid --dev`

- [ ] **Step 6: Verify build**

Run: `yarn build`
Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add src/views/family/submission/ src/views/family/hooks/useSubmission.ts
git commit -m "feat(family): add submission flow with profile form, relationship picker, and chaining"
```

---

## Task 8: Tree Data Hook & Layout Engine

**Files:**
- Create: `src/views/family/hooks/useFamilyTree.ts`

- [ ] **Step 1: Create the tree data hook**

Create `src/views/family/hooks/useFamilyTree.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import ELK, { ElkNode } from 'elkjs/lib/elk.bundled';
import { supabase } from '../supabaseClient';
import { Profile, Relationship } from '../types';

const elk = new ELK();

const ELK_OPTIONS = {
  'elk.algorithm': 'layered',
  'elk.direction': 'DOWN',
  'elk.spacing.nodeNode': '80',
  'elk.layered.spacing.nodeNodeBetweenLayers': '120',
  'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
};

const PROFILE_NODE_WIDTH = 260;
const PROFILE_NODE_HEIGHT = 200;
const COMPACT_NODE_WIDTH = 100;
const COMPACT_NODE_HEIGHT = 80;

export interface TreeData {
  profiles: Profile[];
  relationships: Relationship[];
}

export function useFamilyTree(focusProfileId: string | null) {
  const [treeData, setTreeData] = useState<TreeData>({ profiles: [], relationships: [] });
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);

    const [profilesRes, relationshipsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('status', 'approved'),
      supabase.from('relationships').select('*').eq('status', 'approved'),
    ]);

    const profiles = (profilesRes.data || []) as Profile[];
    const relationships = (relationshipsRes.data || []) as Relationship[];

    setTreeData({ profiles, relationships });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (treeData.profiles.length === 0) return;

    const layoutTree = async () => {
      const visibleProfiles = getVisibleProfiles(
        treeData.profiles,
        treeData.relationships,
        collapsedNodes
      );

      const visibleIds = new Set(visibleProfiles.map(p => p.id));

      const visibleRelationships = treeData.relationships.filter(
        r => visibleIds.has(r.person_a_id) && visibleIds.has(r.person_b_id)
      );

      const elkGraph: ElkNode = {
        id: 'root',
        layoutOptions: ELK_OPTIONS,
        children: visibleProfiles.map(p => ({
          id: p.id,
          width: PROFILE_NODE_WIDTH,
          height: PROFILE_NODE_HEIGHT,
        })),
        edges: visibleRelationships.map(r => ({
          id: r.id,
          sources: [r.person_a_id],
          targets: [r.person_b_id],
        })),
      };

      try {
        const layout = await elk.layout(elkGraph);

        const newNodes: Node[] = (layout.children || []).map(elkNode => {
          const profile = visibleProfiles.find(p => p.id === elkNode.id)!;
          const descendantCount = getDescendantCount(profile.id, treeData.relationships, treeData.profiles);
          const isCollapsed = collapsedNodes.has(profile.id);

          return {
            id: profile.id,
            type: 'profileNode',
            position: { x: elkNode.x || 0, y: elkNode.y || 0 },
            data: {
              profile,
              isCollapsed,
              collapsedCount: isCollapsed ? descendantCount : 0,
              onToggleCollapse: () => toggleCollapse(profile.id),
            },
          };
        });

        const newEdges: Edge[] = visibleRelationships.map(r => ({
          id: r.id,
          source: r.person_a_id,
          target: r.person_b_id,
          type: 'relationshipEdge',
          data: { relationship: r },
        }));

        setNodes(newNodes);
        setEdges(newEdges);
      } catch (err) {
        console.error('Layout failed:', err);
      }
    };

    layoutTree();
  }, [treeData, collapsedNodes]);

  const toggleCollapse = useCallback((nodeId: string) => {
    setCollapsedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  return { nodes, edges, loading, treeData, refetch: fetchData };
}

function getDescendants(
  nodeId: string,
  relationships: Relationship[],
  visited: Set<string> = new Set()
): Set<string> {
  if (visited.has(nodeId)) return visited;
  visited.add(nodeId);

  const children = relationships
    .filter(r => r.relationship_type === 'parent_child' && r.person_a_id === nodeId)
    .map(r => r.person_b_id);

  for (const childId of children) {
    getDescendants(childId, relationships, visited);
  }
  return visited;
}

function getDescendantCount(
  nodeId: string,
  relationships: Relationship[],
  profiles: Profile[]
): number {
  const descendants = getDescendants(nodeId, relationships);
  descendants.delete(nodeId);
  return descendants.size;
}

function getVisibleProfiles(
  profiles: Profile[],
  relationships: Relationship[],
  collapsedNodes: Set<string>
): Profile[] {
  const hiddenIds = new Set<string>();

  for (const collapsedId of collapsedNodes) {
    const descendants = getDescendants(collapsedId, relationships);
    descendants.delete(collapsedId);
    for (const id of descendants) {
      hiddenIds.add(id);
    }
  }

  return profiles.filter(p => !hiddenIds.has(p.id));
}
```

- [ ] **Step 2: Verify build**

Run: `yarn build`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/views/family/hooks/useFamilyTree.ts
git commit -m "feat(family): add tree data hook with elkjs layout and collapse logic"
```

---

## Task 9: Tree Visualization Components

**Files:**
- Create: `src/views/family/tree/ProfileNode.tsx`
- Create: `src/views/family/tree/CompactNode.tsx`
- Create: `src/views/family/tree/RelationshipEdge.tsx`
- Create: `src/views/family/tree/TreeSearch.tsx`
- Create: `src/views/family/tree/FamilyTree.tsx`

- [ ] **Step 1: Create the ProfileNode component (focused view card)**

Create `src/views/family/tree/ProfileNode.tsx`:

```typescript
import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Box, Typography, Avatar, IconButton, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { Profile } from '../types';

interface ProfileNodeData {
  profile: Profile;
  isCollapsed: boolean;
  collapsedCount: number;
  onToggleCollapse: () => void;
  hasPrivateFields?: boolean;
  onRequestLocation?: () => void;
  onRequestContact?: () => void;
}

function ProfileNodeInner({ data }: NodeProps) {
  const theme = useTheme();
  const { profile, isCollapsed, collapsedCount, onToggleCollapse, hasPrivateFields, onRequestLocation, onRequestContact } = data as unknown as ProfileNodeData;

  const initials = `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();

  const birthDisplay = profile.birth_year
    ? `${profile.birth_year_approximate ? 'c. ' : 'b. '}${profile.birth_year}`
    : '';
  const deathDisplay = profile.death_year ? ` — d. ${profile.death_year}` : '';

  return (
    <Box
      sx={{
        background: theme.palette.background.paper,
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        width: 260,
        cursor: 'pointer',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />

      <Box
        sx={{
          height: 60,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark || theme.palette.primary.main} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Avatar
          src={profile.photo_url || undefined}
          sx={{
            width: 56,
            height: 56,
            border: `3px solid ${theme.palette.background.paper}`,
            position: 'absolute',
            bottom: -28,
            bgcolor: theme.palette.secondary.main,
            fontSize: 20,
            fontWeight: 'bold',
          }}
        >
          {initials}
        </Avatar>
      </Box>

      <Box sx={{ pt: 4, pb: 2, px: 2, textAlign: 'center' }}>
        <Typography variant="subtitle1" fontWeight={600}>
          {profile.first_name} {profile.last_name}
        </Typography>
        {(birthDisplay || deathDisplay) && (
          <Typography variant="caption" color="text.secondary">
            {birthDisplay}{deathDisplay}
          </Typography>
        )}
        {profile.bio && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, fontStyle: 'italic', fontSize: '0.75rem' }}
          >
            "{profile.bio}"
          </Typography>
        )}

        {hasPrivateFields && (
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', mt: 1 }}>
            {onRequestLocation && (
              <Chip
                label="Request Location"
                size="small"
                variant="outlined"
                color="primary"
                onClick={(e) => { e.stopPropagation(); onRequestLocation(); }}
                sx={{ fontSize: '0.65rem' }}
              />
            )}
            {onRequestContact && (
              <Chip
                label="Request Contact"
                size="small"
                variant="outlined"
                color="primary"
                onClick={(e) => { e.stopPropagation(); onRequestContact(); }}
                sx={{ fontSize: '0.65rem' }}
              />
            )}
          </Box>
        )}

        {collapsedCount > 0 && (
          <Box sx={{ mt: 1 }}>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onToggleCollapse(); }}>
              {isCollapsed ? <UnfoldMoreIcon fontSize="small" /> : <UnfoldLessIcon fontSize="small" />}
            </IconButton>
            {isCollapsed && (
              <Chip label={`+${collapsedCount}`} size="small" sx={{ ml: 0.5 }} />
            )}
          </Box>
        )}
      </Box>

      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </Box>
  );
}

export const ProfileNode = memo(ProfileNodeInner);
```

- [ ] **Step 2: Create the CompactNode component (zoomed-out view)**

Create `src/views/family/tree/CompactNode.tsx`:

```typescript
import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Box, Typography, Avatar, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Profile } from '../types';

interface CompactNodeData {
  profile: Profile;
  isCollapsed: boolean;
  collapsedCount: number;
}

function CompactNodeInner({ data }: NodeProps) {
  const theme = useTheme();
  const { profile, isCollapsed, collapsedCount } = data as unknown as CompactNodeData;
  const initials = `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
      <Avatar
        src={profile.photo_url || undefined}
        sx={{
          width: 40,
          height: 40,
          bgcolor: theme.palette.primary.main,
          fontSize: 14,
          fontWeight: 'bold',
        }}
      >
        {initials}
      </Avatar>
      <Typography variant="caption" sx={{ fontWeight: 600, textAlign: 'center', maxWidth: 80 }} noWrap>
        {profile.first_name}
      </Typography>
      {isCollapsed && collapsedCount > 0 && (
        <Chip label={`+${collapsedCount}`} size="small" sx={{ height: 18, fontSize: '0.6rem' }} />
      )}
      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </Box>
  );
}

export const CompactNode = memo(CompactNodeInner);
```

- [ ] **Step 3: Create the RelationshipEdge component**

Create `src/views/family/tree/RelationshipEdge.tsx`:

```typescript
import { BaseEdge, getSmoothStepPath, EdgeProps } from '@xyflow/react';
import { useTheme } from '@mui/material/styles';
import { Relationship } from '../types';

interface RelationshipEdgeData {
  relationship: Relationship;
}

export function RelationshipEdge(props: EdgeProps) {
  const theme = useTheme();
  const { relationship } = (props.data || {}) as RelationshipEdgeData;

  const [edgePath] = getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    borderRadius: 12,
  });

  const isSpouse = relationship?.relationship_type === 'spouse';
  const isDivorced = isSpouse && relationship?.end_year != null;

  return (
    <BaseEdge
      path={edgePath}
      style={{
        stroke: theme.palette.divider,
        strokeWidth: isSpouse ? 2 : 1.5,
        strokeDasharray: isDivorced ? '6 3' : undefined,
      }}
    />
  );
}
```

- [ ] **Step 4: Create the TreeSearch component**

Create `src/views/family/tree/TreeSearch.tsx`:

```typescript
import { Autocomplete, TextField, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Profile } from '../types';

interface TreeSearchProps {
  profiles: Profile[];
  onSelect: (profileId: string) => void;
}

export function TreeSearch({ profiles, onSelect }: TreeSearchProps) {
  const options = profiles.map(p => ({
    id: p.id,
    label: `${p.first_name} ${p.last_name}`,
  }));

  return (
    <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 10, width: 280 }}>
      <Autocomplete
        options={options}
        getOptionLabel={(o) => o.label}
        onChange={(_, v) => { if (v) onSelect(v.id); }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search family members..."
            size="small"
            InputProps={{
              ...params.InputProps,
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 1,
              '& .MuiOutlinedInput-root': { borderRadius: 1 },
            }}
          />
        )}
        size="small"
        clearOnBlur
        isOptionEqualToValue={(o, v) => o.id === v.id}
      />
    </Box>
  );
}
```

- [ ] **Step 5: Create the FamilyTree component (main canvas)**

Create `src/views/family/tree/FamilyTree.tsx`:

```typescript
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  useReactFlow,
  ReactFlowProvider,
  useViewport,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { ProfileNode } from './ProfileNode';
import { CompactNode } from './CompactNode';
import { RelationshipEdge } from './RelationshipEdge';
import { TreeSearch } from './TreeSearch';
import { useFamilyTree } from '../hooks/useFamilyTree';

const ZOOM_THRESHOLD = 0.6;

interface FamilyTreeProps {
  focusProfileId: string;
}

const nodeTypes = {
  profileNode: ProfileNode,
  compactNode: CompactNode,
};

const edgeTypes = {
  relationshipEdge: RelationshipEdge,
};

function FamilyTreeInner({ focusProfileId }: FamilyTreeProps) {
  const { nodes, edges, loading, treeData } = useFamilyTree(focusProfileId);
  const { fitView, setCenter, getZoom } = useReactFlow();
  const { zoom } = useViewport();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const initialFitDone = useRef(false);

  useEffect(() => {
    if (nodes.length > 0 && !initialFitDone.current) {
      const focusNode = nodes.find(n => n.id === focusProfileId);
      if (focusNode) {
        setTimeout(() => {
          setCenter(
            focusNode.position.x + 130,
            focusNode.position.y + 100,
            { zoom: 1, duration: 500 }
          );
          initialFitDone.current = true;
        }, 100);
      }
    }
  }, [nodes, focusProfileId, setCenter]);

  const displayNodes = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      type: zoom < ZOOM_THRESHOLD ? 'compactNode' : 'profileNode',
    }));
  }, [nodes, zoom]);

  const handleNodeClick = useCallback((_: any, node: { id: string; position: { x: number; y: number } }) => {
    setCenter(node.position.x + 130, node.position.y + 100, {
      zoom: 1,
      duration: 500,
    });
  }, [setCenter]);

  const handleSearchSelect = useCallback((profileId: string) => {
    const node = nodes.find(n => n.id === profileId);
    if (node) {
      setCenter(node.position.x + 130, node.position.y + 100, {
        zoom: 1,
        duration: 500,
      });
    }
  }, [nodes, setCenter]);

  if (loading) return null;

  return (
    <Box sx={{ width: '100%', height: 'calc(100vh - 140px)', position: 'relative' }}>
      <TreeSearch profiles={treeData.profiles} onSelect={handleSearchSelect} />
      <ReactFlow
        nodes={displayNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        fitView={false}
        minZoom={0.1}
        maxZoom={1.5}
        panOnDrag
        zoomOnScroll={!isMobile}
        zoomOnPinch
        preventScrolling
        proOptions={{ hideAttribution: true }}
      >
        {!isMobile && zoom < ZOOM_THRESHOLD && (
          <MiniMap
            nodeStrokeWidth={3}
            nodeColor={theme.palette.primary.main}
            maskColor={
              theme.palette.mode === 'dark'
                ? 'rgba(0,0,0,0.7)'
                : 'rgba(255,255,255,0.7)'
            }
          />
        )}
        <Controls showInteractive={false} />
      </ReactFlow>
    </Box>
  );
}

export function FamilyTree(props: FamilyTreeProps) {
  return (
    <ReactFlowProvider>
      <FamilyTreeInner {...props} />
    </ReactFlowProvider>
  );
}
```

- [ ] **Step 6: Verify build**

Run: `yarn build`
Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add src/views/family/tree/
git commit -m "feat(family): add tree visualization with profile cards, compact nodes, search, and zoom transitions"
```

---

## Task 10: Family Page & Route Registration

**Files:**
- Create: `src/views/family/FamilyPage.tsx`
- Create: `src/views/family/index.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create the FamilyPage component**

Create `src/views/family/FamilyPage.tsx`:

```typescript
import { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './auth/LoginPage';
import { PendingPage } from './auth/PendingPage';
import { SubmissionFlow } from './submission/SubmissionFlow';
import { FamilyTree } from './tree/FamilyTree';

export function FamilyPage() {
  const { accessState, loading, sendMagicLink, signOut } = useAuth();
  const [showSubmission, setShowSubmission] = useState(false);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  switch (accessState.type) {
    case 'unauthenticated':
      return <LoginPage onSendMagicLink={sendMagicLink} />;

    case 'new_user':
      return (
        <SubmissionFlow
          isSelf={true}
          onComplete={() => window.location.reload()}
        />
      );

    case 'pending':
      return <PendingPage state="pending" onSignOut={signOut} />;

    case 'denied':
      return <PendingPage state="denied" onSignOut={signOut} />;

    case 'approved':
      if (showSubmission) {
        return (
          <SubmissionFlow
            isSelf={false}
            onComplete={() => setShowSubmission(false)}
          />
        );
      }
      return <FamilyTree focusProfileId={accessState.profileId} />;
  }
}
```

- [ ] **Step 2: Create the index file**

Create `src/views/family/index.tsx`:

```typescript
export { FamilyPage } from './FamilyPage';
```

- [ ] **Step 3: Register routes in App.tsx**

Add the lazy import near the other lazy imports in `src/App.tsx` (around line 38):

```typescript
const FamilyPage = lazy(() => import('./views/family').then(m => ({ default: m.FamilyPage })));
const AuthCallback = lazy(() => import('./views/family/auth/AuthCallback').then(m => ({ default: m.AuthCallback })));
const AdminDashboard = lazy(() => import('./views/family/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
```

Add routes inside the `<Route element={<AppProviderLayout />}>` block, before the `<Route path="*"` catch-all:

```typescript
<Route path="/family" element={<FamilyPage />} />
<Route path="/family/auth/callback" element={<AuthCallback />} />
<Route path="/family/admin" element={<AdminDashboard />} />
```

- [ ] **Step 4: Verify build**

Run: `yarn build`
Expected: Build may warn about missing AdminDashboard — that's OK, we'll create it in Task 11.

- [ ] **Step 5: Commit**

```bash
git add src/views/family/FamilyPage.tsx src/views/family/index.tsx src/App.tsx
git commit -m "feat(family): add family page with auth gating and register routes"
```

---

## Task 11: Admin Dashboard

**Files:**
- Create: `src/views/family/admin/AdminDashboard.tsx`
- Create: `src/views/family/admin/SubmissionCard.tsx`
- Create: `src/views/family/admin/ProfileEditor.tsx`

- [ ] **Step 1: Create SubmissionCard component**

Create `src/views/family/admin/SubmissionCard.tsx`:

```typescript
import {
  Card, CardContent, Typography, Box, Button, Avatar, Chip, Divider,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { Profile, Relationship } from '../types';

interface SubmissionCardProps {
  profile: Profile;
  relationships: Relationship[];
  allProfiles: Profile[];
  onApprove: (profileId: string) => void;
  onDeny: (profileId: string) => void;
  onEdit: (profile: Profile) => void;
  hasDependents: boolean;
}

export function SubmissionCard({
  profile,
  relationships,
  allProfiles,
  onApprove,
  onDeny,
  onEdit,
  hasDependents,
}: SubmissionCardProps) {
  const initials = `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();

  const getPersonName = (id: string) => {
    const p = allProfiles.find(ap => ap.id === id);
    return p ? `${p.first_name} ${p.last_name}` : 'Unknown';
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Avatar
            src={profile.photo_url || undefined}
            sx={{ width: 48, height: 48 }}
          >
            {initials}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">
              {profile.first_name} {profile.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profile.birth_year
                ? `${profile.birth_year_approximate ? 'c. ' : 'b. '}${profile.birth_year}`
                : 'Birth year unknown'}
              {profile.death_year ? ` — d. ${profile.death_year}` : ''}
            </Typography>
            {profile.bio && (
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                "{profile.bio}"
              </Typography>
            )}

            <Divider sx={{ my: 1.5 }} />

            <Typography variant="caption" color="text.secondary" display="block">
              Relationships:
            </Typography>
            {relationships.map(r => {
              const isParent = r.relationship_type === 'parent_child' && r.person_a_id === profile.id;
              const isChild = r.relationship_type === 'parent_child' && r.person_b_id === profile.id;
              const otherPersonId = r.person_a_id === profile.id ? r.person_b_id : r.person_a_id;
              const label = isParent
                ? `Parent of ${getPersonName(otherPersonId)}`
                : isChild
                  ? `Child of ${getPersonName(otherPersonId)}`
                  : `Spouse of ${getPersonName(otherPersonId)}`;

              return (
                <Chip
                  key={r.id}
                  label={label}
                  size="small"
                  variant="outlined"
                  sx={{ mr: 0.5, mt: 0.5 }}
                />
              );
            })}

            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Submitted {new Date(profile.created_at).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => onEdit(profile)}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            startIcon={<CloseIcon />}
            onClick={() => {
              if (hasDependents) {
                const confirmed = window.confirm(
                  'This profile has other pending submissions that depend on it. Denying it will also deny those relationships. Continue?'
                );
                if (!confirmed) return;
              }
              onDeny(profile.id);
            }}
          >
            Deny
          </Button>
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<CheckIcon />}
            onClick={() => onApprove(profile.id)}
          >
            Approve
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Create ProfileEditor component**

Create `src/views/family/admin/ProfileEditor.tsx`:

```typescript
import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Box, Checkbox, FormControlLabel,
} from '@mui/material';
import { Profile } from '../types';
import { supabase } from '../supabaseClient';

interface ProfileEditorProps {
  profile: Profile;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ProfileEditor({ profile, open, onClose, onSaved }: ProfileEditorProps) {
  const [form, setForm] = useState({
    first_name: profile.first_name,
    last_name: profile.last_name,
    birth_year: profile.birth_year,
    birth_year_approximate: profile.birth_year_approximate,
    death_year: profile.death_year,
    bio: profile.bio || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await supabase
      .from('profiles')
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        birth_year: form.birth_year,
        birth_year_approximate: form.birth_year_approximate,
        death_year: form.death_year,
        bio: form.bio || null,
      })
      .eq('id', profile.id);
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 2, mt: 1, mb: 2 }}>
          <TextField
            label="First name"
            value={form.first_name}
            onChange={(e) => setForm(f => ({ ...f, first_name: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Last name"
            value={form.last_name}
            onChange={(e) => setForm(f => ({ ...f, last_name: e.target.value }))}
            fullWidth
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <TextField
            label="Birth year"
            type="number"
            value={form.birth_year ?? ''}
            onChange={(e) => setForm(f => ({ ...f, birth_year: e.target.value ? parseInt(e.target.value) : null }))}
            sx={{ width: 140 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.birth_year_approximate}
                onChange={(e) => setForm(f => ({ ...f, birth_year_approximate: e.target.checked }))}
              />
            }
            label="Approximate"
          />
          <TextField
            label="Death year"
            type="number"
            value={form.death_year ?? ''}
            onChange={(e) => setForm(f => ({ ...f, death_year: e.target.value ? parseInt(e.target.value) : null }))}
            sx={{ width: 140 }}
          />
        </Box>
        <TextField
          label="Bio"
          value={form.bio}
          onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
          multiline
          rows={2}
          fullWidth
          inputProps={{ maxLength: 280 }}
          helperText={`${form.bio.length}/280`}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

- [ ] **Step 3: Create AdminDashboard component**

Create `src/views/family/admin/AdminDashboard.tsx`:

```typescript
import { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Tabs, Tab, Button, Alert, CircularProgress,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import { Profile, Relationship, ProfileClaim } from '../types';
import { SubmissionCard } from './SubmissionCard';
import { ProfileEditor } from './ProfileEditor';
import { NotFound } from '../../NotFound';

export function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [tab, setTab] = useState(0);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [claims, setClaims] = useState<ProfileClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [profilesRes, relsRes, claimsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('relationships').select('*'),
      supabase.from('profile_claims').select('*').order('created_at', { ascending: false }),
    ]);
    setProfiles((profilesRes.data || []) as Profile[]);
    setRelationships((relsRes.data || []) as Relationship[]);
    setClaims((claimsRes.data || []) as ProfileClaim[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin, fetchData]);

  if (authLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  if (!isAdmin) {
    return <NotFound />;
  }

  const pendingProfiles = profiles.filter(p => p.status === 'pending');
  const pendingClaims = claims.filter(c => c.status === 'pending');

  const batchGroups = new Map<string, Profile[]>();
  for (const p of pendingProfiles) {
    const batch = batchGroups.get(p.submission_batch_id) || [];
    batch.push(p);
    batchGroups.set(p.submission_batch_id, batch);
  }

  const handleApprove = async (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;

    await supabase.from('profiles').update({ status: 'approved' }).eq('id', profileId);

    await supabase
      .from('relationships')
      .update({ status: 'approved' })
      .or(`person_a_id.eq.${profileId},person_b_id.eq.${profileId}`)
      .eq('status', 'pending');

    const pendingClaimForProfile = claims.find(
      c => c.profile_id === profileId && c.status === 'pending'
    );
    if (pendingClaimForProfile && profile.death_year != null) {
      await supabase
        .from('profile_claims')
        .update({ status: 'approved', resolved_at: new Date().toISOString() })
        .eq('id', pendingClaimForProfile.id);
    }

    fetchData();
  };

  const handleDeny = async (profileId: string) => {
    await supabase.from('profiles').update({ status: 'denied' }).eq('id', profileId);

    await supabase
      .from('relationships')
      .update({ status: 'denied' })
      .or(`person_a_id.eq.${profileId},person_b_id.eq.${profileId}`)
      .eq('status', 'pending');

    fetchData();
  };

  const handleApproveClaim = async (claimId: string) => {
    await supabase
      .from('profile_claims')
      .update({ status: 'approved', resolved_at: new Date().toISOString() })
      .eq('id', claimId);
    fetchData();
  };

  const handleDenyClaim = async (claimId: string) => {
    await supabase
      .from('profile_claims')
      .update({ status: 'denied', resolved_at: new Date().toISOString() })
      .eq('id', claimId);
    fetchData();
  };

  const hasDependents = (profileId: string) => {
    return relationships.some(
      r => r.status === 'pending' &&
        (r.person_a_id === profileId || r.person_b_id === profileId) &&
        r.person_a_id !== r.person_b_id
    );
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Family Tree Admin
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label={`Submissions (${pendingProfiles.length})`} />
        <Tab label={`Claims (${pendingClaims.length})`} />
      </Tabs>

      {loading && <CircularProgress />}

      {!loading && tab === 0 && (
        <>
          {pendingProfiles.length === 0 ? (
            <Alert severity="info">No pending submissions.</Alert>
          ) : (
            Array.from(batchGroups.entries()).map(([batchId, batchProfiles]) => (
              <Box key={batchId} sx={{ mb: 4 }}>
                <Typography variant="overline" color="text.secondary">
                  Batch — {batchProfiles.length} profile{batchProfiles.length > 1 ? 's' : ''}
                </Typography>
                {batchProfiles.map(profile => (
                  <SubmissionCard
                    key={profile.id}
                    profile={profile}
                    relationships={relationships.filter(
                      r => r.person_a_id === profile.id || r.person_b_id === profile.id
                    )}
                    allProfiles={profiles}
                    onApprove={handleApprove}
                    onDeny={handleDeny}
                    onEdit={setEditingProfile}
                    hasDependents={hasDependents(profile.id)}
                  />
                ))}
              </Box>
            ))
          )}
        </>
      )}

      {!loading && tab === 1 && (
        <>
          {pendingClaims.length === 0 ? (
            <Alert severity="info">No pending claims.</Alert>
          ) : (
            pendingClaims.map(claim => {
              const profile = profiles.find(p => p.id === claim.profile_id);
              return (
                <Box key={claim.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="subtitle1">
                    Claim for: {profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Claimant: {claim.claimant_id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Submitted {new Date(claim.created_at).toLocaleDateString()}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button size="small" color="error" onClick={() => handleDenyClaim(claim.id)}>
                      Deny
                    </Button>
                    <Button size="small" variant="contained" color="success" onClick={() => handleApproveClaim(claim.id)}>
                      Approve
                    </Button>
                  </Box>
                </Box>
              );
            })
          )}
        </>
      )}

      {editingProfile && (
        <ProfileEditor
          profile={editingProfile}
          open={true}
          onClose={() => setEditingProfile(null)}
          onSaved={fetchData}
        />
      )}
    </Container>
  );
}
```

- [ ] **Step 4: Verify build**

Run: `yarn build`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/views/family/admin/
git commit -m "feat(family): add admin dashboard with submission review, claim management, and profile editor"
```

---

## Task 12: Admin Merge Profiles Action

**Files:**
- Modify: `src/views/family/admin/AdminDashboard.tsx`

- [ ] **Step 1: Add merge UI to admin dashboard**

Add a third tab "All Profiles" to the AdminDashboard `Tabs` component. In this tab, render all approved profiles with a "Merge" button that opens a dialog. The merge dialog lets admin:

1. Select two profiles to merge
2. Pick which is the primary (keeps its data)
3. Confirm — the action transfers all relationships from the duplicate to the primary and soft-deletes the duplicate

Add this handler to AdminDashboard:

```typescript
const handleMerge = async (primaryId: string, duplicateId: string) => {
  // Transfer relationships: update person_a_id or person_b_id from duplicate to primary
  await supabase
    .from('relationships')
    .update({ person_a_id: primaryId })
    .eq('person_a_id', duplicateId);
  await supabase
    .from('relationships')
    .update({ person_b_id: primaryId })
    .eq('person_b_id', duplicateId);

  // Handle claims: keep primary's claim, deny duplicate's
  await supabase
    .from('profile_claims')
    .update({ status: 'denied', resolved_at: new Date().toISOString() })
    .eq('profile_id', duplicateId);

  // Soft-delete duplicate profile
  await supabase
    .from('profiles')
    .update({ status: 'denied' })
    .eq('id', duplicateId);

  fetchData();
};
```

Add the "All Profiles" tab and a simple merge selection UI with two `Autocomplete` fields (primary, duplicate) and a "Merge" button.

- [ ] **Step 2: Verify build**

Run: `yarn build`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/views/family/admin/AdminDashboard.tsx
git commit -m "feat(family): add merge profiles action to admin dashboard"
```

---

## Task 13: Contact/Location Request (Edge Function Placeholder)


**Files:**
- Modify: `src/views/family/tree/ProfileNode.tsx` (already has button slots)
- Create: `src/views/family/hooks/useContactRequest.ts`

- [ ] **Step 1: Create the contact request hook**

Create `src/views/family/hooks/useContactRequest.ts`:

```typescript
import { useState } from 'react';
import { supabase } from '../supabaseClient';

export function useContactRequest() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<Set<string>>(new Set());

  const requestInfo = async (
    profileId: string,
    profileName: string,
    type: 'location' | 'contact'
  ) => {
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.functions.invoke('request-info', {
        body: {
          requester_email: user.email,
          profile_id: profileId,
          profile_name: profileName,
          request_type: type,
        },
      });

      if (error) throw error;
      setSent(prev => new Set(prev).add(`${profileId}-${type}`));
    } catch (err) {
      console.error('Request failed:', err);
    } finally {
      setSending(false);
    }
  };

  const hasSent = (profileId: string, type: 'location' | 'contact') =>
    sent.has(`${profileId}-${type}`);

  return { requestInfo, sending, hasSent };
}
```

- [ ] **Step 2: Create the Supabase Edge Function source**

Create `supabase/functions/request-info/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  const { requester_email, profile_id, profile_name, request_type } = await req.json();

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Send email via Supabase's built-in email (or integrate with a service like Resend)
  // For now, log the request — the admin can check function logs
  console.log(
    `INFO REQUEST: ${requester_email} requested ${request_type} for ${profile_name} (${profile_id})`
  );

  // TODO: Integrate with email service (Resend, SendGrid, etc.)
  // await fetch('https://api.resend.com/emails', {
  //   method: 'POST',
  //   headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     from: 'Family Tree <noreply@yourdomain.com>',
  //     to: ADMIN_EMAIL,
  //     subject: `Family Tree: ${requester_email} requested ${request_type} for ${profile_name}`,
  //     text: `${requester_email} is requesting the ${request_type} of ${profile_name}.`,
  //   }),
  // });

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

- [ ] **Step 3: Commit**

```bash
git add src/views/family/hooks/useContactRequest.ts supabase/functions/request-info/index.ts
git commit -m "feat(family): add contact/location request hook and edge function placeholder"
```

> **Note to implementer**: The edge function currently logs requests. To enable actual emails, integrate with Resend, SendGrid, or another email API and set the `ADMIN_EMAIL` env var in the Supabase project settings.

---

## Task 14: Add "Add Family Member" Button to Tree View

**Files:**
- Modify: `src/views/family/FamilyPage.tsx`

- [ ] **Step 1: Add the floating action button to the tree view**

Update `src/views/family/FamilyPage.tsx` — add a FAB for "Add Family Member" in the approved state:

Replace the `case 'approved':` block:

```typescript
    case 'approved':
      if (showSubmission) {
        return (
          <SubmissionFlow
            isSelf={false}
            onComplete={() => setShowSubmission(false)}
          />
        );
      }
      return (
        <Box sx={{ position: 'relative' }}>
          <FamilyTree focusProfileId={accessState.profileId} />
          <Fab
            color="primary"
            sx={{ position: 'fixed', bottom: 24, right: 24 }}
            onClick={() => setShowSubmission(true)}
          >
            <PersonAddIcon />
          </Fab>
        </Box>
      );
```

Add imports at top of FamilyPage.tsx:

```typescript
import { Fab } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
```

- [ ] **Step 2: Verify build**

Run: `yarn build`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/views/family/FamilyPage.tsx
git commit -m "feat(family): add floating action button for adding family members"
```

---

## Task 15: Sign Out & Navigation Integration

**Files:**
- Modify: `src/views/family/FamilyPage.tsx`
- Modify: `src/views/family/tree/FamilyTree.tsx`

- [ ] **Step 1: Add sign-out button to tree view**

In `src/views/family/tree/FamilyTree.tsx`, add a sign-out prop to `FamilyTreeProps`:

```typescript
interface FamilyTreeProps {
  focusProfileId: string;
  onSignOut?: () => void;
}
```

Add a sign-out button in the top-right of the tree area inside `FamilyTreeInner`, next to the ReactFlow:

```typescript
{props.onSignOut && (
  <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
    <Button variant="outlined" size="small" onClick={props.onSignOut}>
      Sign out
    </Button>
  </Box>
)}
```

Add `Button` to the MUI import.

- [ ] **Step 2: Pass signOut to FamilyTree from FamilyPage**

In `src/views/family/FamilyPage.tsx`, update the FamilyTree usage:

```typescript
<FamilyTree focusProfileId={accessState.profileId} onSignOut={signOut} />
```

- [ ] **Step 3: Verify build**

Run: `yarn build`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/views/family/FamilyPage.tsx src/views/family/tree/FamilyTree.tsx
git commit -m "feat(family): add sign-out button to tree view"
```

---

## Task 16: End-to-End Smoke Test

This task is manual verification that everything works together.

- [ ] **Step 1: Ensure Supabase project is set up**

Verify:
- Migration SQL has been run
- Auth redirect URL is configured for `http://localhost:3000/family/auth/callback`
- `photos` storage bucket exists with public read
- `.env` has correct `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`
- Admin user's auth ID is in `admin_users` table
- At least one seeded profile exists with `status = approved`

- [ ] **Step 2: Start dev server**

Run: `yarn start`

- [ ] **Step 3: Test auth flow**

1. Navigate to `http://localhost:3000/family`
2. Verify login page shows
3. Enter email, receive magic link
4. Click magic link — should redirect back to `/family`

- [ ] **Step 4: Test submission flow (new user)**

1. After login as a new user, verify submission form appears
2. Fill in profile details
3. Select a relationship to the seeded profile
4. Submit — verify "pending" page appears

- [ ] **Step 5: Test admin dashboard**

1. Log in as admin
2. Navigate to `/family/admin`
3. Verify pending submission appears
4. Approve it
5. Verify the user can now see the tree

- [ ] **Step 6: Test tree visualization**

1. Verify tree renders with approved profiles
2. Test zoom in/out — cards transition between full and compact
3. Test search — type a name, select, tree navigates
4. Test click-to-center on a node
5. Test collapse/expand if enough nodes exist

- [ ] **Step 7: Test adding another family member (chaining)**

1. Click the FAB "Add Family Member"
2. Fill in a new person's details
3. Relate to someone on the tree
4. Add another person chained to the first
5. Verify both appear in admin dashboard as a batch

---

## Task 17: Final Cleanup & Build Verification

- [ ] **Step 1: Verify production build**

Run: `yarn build`
Expected: Clean build, no errors or warnings.

- [ ] **Step 2: Check TypeScript strict mode**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 3: Verify Docker build still works**

Run: `docker build -t adebalogun .`
Expected: Build succeeds.

- [ ] **Step 4: Final commit if any cleanup was needed**

```bash
git add -A
git commit -m "chore(family): final cleanup and build verification"
```
