# Family Tree Explorer — Design Spec

A password-protected, interactive family tree explorer at `/family` on the adebalogun personal website. Family members authenticate via magic link, explore a zoomable tree visualization, and submit new members for admin approval.

## Architecture

**Frontend**: New route (`/family`) in the existing React 18 + TypeScript + MUI app. Lazy-loaded like all other routes.

**Backend**: Supabase project providing:
- **Postgres database** for all family tree data
- **Magic link authentication** via Supabase Auth
- **Row-level security (RLS)** policies for access control
- **Storage** bucket for profile photos

No Express backend. The React app communicates directly with Supabase via `@supabase/supabase-js`.

## Styling

Inherits the existing site aesthetic:
- **Fonts**: Space Mono (headings), Open Sans (body)
- **Colors**: `#5D3FD3` primary (light mode), `#08FF00` primary (dark mode)
- **Components**: MUI v5 with the existing theme from `src/theme.ts`
- **Dark/light mode**: Fully supported via existing `ColorModeContext`
- **Layout**: Wrapped in existing `AppProviderLayout` (navbar + footer)

## Authentication & Access

### Flow

1. User navigates to `/family` → sees a landing page with email input
2. User enters email → Supabase sends a magic link
3. User clicks link → redirected back to `/family` with active session

### Access states after login

- **New email (no profile)**: Prompted to either (a) submit their own info and relationship to someone on the tree, or (b) claim an existing unclaimed profile on the tree
- **Pending approval**: Sees a "waiting for approval" message
- **Approved**: Full tree access
- **Denied / claimed profile conflict**: Sees a "request denied" message with option to contact admin

### Profile claiming

- A user can claim an unclaimed profile by selecting it and verifying via their authenticated email
- Once a profile is claimed, subsequent claim attempts by other emails are denied
- Admin can override claims from the dashboard

## Data Model

### Tables

**profiles**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| first_name | text | Required |
| last_name | text | Required |
| birth_year | int | Required |
| death_year | int | Nullable |
| bio | text | Nullable, max 150 chars |
| location | text | Nullable, private |
| contact_info | text | Nullable, private |
| photo_url | text | Nullable, Supabase storage URL |
| claimed_by | uuid (FK → auth.users) | Nullable, the user who claimed this profile |
| created_by | uuid (FK → auth.users) | The user who submitted this profile |
| status | enum | `pending`, `approved`, `denied` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**relationships**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| person_id | uuid (FK → profiles) | |
| related_to_id | uuid (FK → profiles) | |
| relationship_type | enum | `parent`, `child`, `spouse` |
| status | enum | `pending`, `approved`, `denied` |
| created_by | uuid (FK → auth.users) | |
| created_at | timestamptz | |

Relationships are stored directionally. A `parent` relationship from A→B means "A is a parent of B." The app derives siblings (shared parent), grandparents (parent's parent), etc. by traversal.

**admin_users**
| Column | Type | Notes |
|--------|------|-------|
| user_id | uuid (FK → auth.users) | |

Simple table that marks which authenticated users have admin privileges. Initially just the site owner.

### Private Fields

`location` and `contact_info` are stored in a separate **private_fields** table:

| Column | Type | Notes |
|--------|------|-------|
| profile_id | uuid (FK → profiles, PK) | |
| location | text | Nullable |
| contact_info | text | Nullable |

This separation allows RLS to restrict access: only the profile owner (`claimed_by`) and admins can read `private_fields`. The main `profiles` table is readable by all approved users.

### Row-Level Security

- **profiles**: Approved users can read all approved profiles.
- **private_fields**: Only the profile owner (claimed_by matches auth.uid()) and admin users can select.
- **relationships**: Approved users can read all approved relationships.
- **Inserts**: Any authenticated user can insert profiles and relationships with `status = 'pending'`.
- **Admin**: Admin users can read/update all rows (approve, deny, edit).

### Bootstrapping

The admin (site owner) seeds the initial tree by inserting their own profile directly in Supabase (status: `approved`, claimed_by: their auth user ID) and optionally a few ancestor profiles. This gives the first real users someone to relate to. The admin dashboard is available from the start for managing subsequent submissions.

## Tree Visualization

### Rendering

Use **React Flow** (`@xyflow/react`) for the tree canvas. It provides:
- Pan and zoom with mouse/touch
- Custom node rendering (MUI-styled profile cards)
- Edge routing for relationship lines
- Minimap plugin
- Fits-view and zoom controls

### Zoom behavior

**Focused view (default zoom / close-up)**:
- Centered on the logged-in user's profile (or the profile they claimed)
- Shows one generation up (parents) and current generation (siblings) auto-expanded
- Children shown below if they exist
- Spouse shown adjacent
- Profile cards display: photo/initials circle, full name, birth/death years, bio snippet, "Request Location" / "Request Contact" buttons

**Zoomed-out view (canvas)**:
- As the user zooms out, profile cards transition to compact nodes (initials circle + name only)
- Collapsed branches show a "+N" badge indicating hidden descendants
- Mini-map appears in the corner showing the full tree extent with a viewport indicator
- Click any node to re-center and zoom back in to focused view

**Collapse/expand**:
- Nodes have a toggle to collapse/expand their descendants
- Collapsed nodes show a "+N" count badge
- Collapse state is local (not persisted)

### Navigation

- **Click a person**: Smooth animated pan + zoom to center on them in focused view
- **Search**: Search bar (top of page) with autocomplete — type a name, select, and the tree navigates to that person
- **Zoom controls**: +/- buttons and scroll/pinch
- **Mini-map**: Click on the mini-map to jump to that area

## Submission Flow

### Adding yourself (new user)

1. After magic link login, new user sees: "Welcome! To explore the family tree, tell us about yourself."
2. Form fields: first name, last name, birth year, photo (optional upload), bio (optional, 150 char max), location (optional, marked as private), contact info (optional, marked as private)
3. Relationship step: "How are you related to someone on the tree?"
   - Shows a searchable list of approved profiles
   - User selects a person and a relationship type (e.g., "I am the child of [person]", "I am the spouse of [person]", "I am the parent of [person]")
4. Submit → status set to `pending` → user sees "Your request has been submitted. You'll get access once approved."

### Adding other people

After the initial submission (or for already-approved users):

1. "Add a family member" button available in the UI
2. Same profile form (first name, last name, birth year, etc.)
3. Relationship step: relate to someone already on the tree OR someone submitted in the current session (chaining)
   - Chaining: if user added "Mom" and now adds "Grandma," they can say "Grandma is the parent of Mom" even though Mom is still pending
4. Each submission is independent for approval — admin can approve some and deny others from a batch

### Relationship types

Stored relationships: `parent`, `child`, `spouse`. The submission form presents user-friendly language:
- "I am the **child** of [person]"
- "I am the **parent** of [person]"
- "I am the **spouse** of [person]"
- "[New person] is the **child** of [person]"
- "[New person] is the **parent** of [person]"
- "[New person] is the **spouse** of [person]"

## Contact/Location Request

When viewing a profile card, approved users see:
- **"Request Location"** button (if location exists but is private)
- **"Request Contact"** button (if contact info exists but is private)

Clicking either sends an email to the admin (site owner) via Supabase Edge Function:
- Subject: "Family Tree: [requester name] requested [location/contact] for [person name]"
- Body: requester's name, email, and which person's info they want
- Admin manually forwards the info at their discretion

These buttons are hidden if the field is empty (nothing to request).

## Admin Dashboard

### Access

Route: `/family/admin`. Only visible/accessible to users in the `admin_users` table. Returns 404 for non-admins.

### Pending submissions view

- List of pending profiles with all submitted info visible
- Each shows: name, birth year, bio, photo, who submitted it, when, and the proposed relationship
- **Approve** button: sets profile and its relationships to `approved`, profile appears on tree
- **Deny** button: sets status to `denied`, profile does not appear on tree
- **Edit** button: admin can correct names, dates, relationships before approving
- Batch operations: approve/deny multiple at once
- Submissions grouped by submitter and session for context ("Ade submitted 3 people: Mom → Grandma → Great-grandma")

### Tree management

- Admin can edit any approved profile
- Admin can remove profiles (soft delete)
- Admin can reassign or remove relationships
- Admin can override profile claims

## File Structure

```
src/views/family/
├── index.tsx                    # Lazy-loaded route entry
├── FamilyPage.tsx               # Main page — auth gate + tree or onboarding
├── tree/
│   ├── FamilyTree.tsx           # React Flow canvas + zoom logic
│   ├── ProfileNode.tsx          # Full profile card node (focused view)
│   ├── CompactNode.tsx          # Initials + name node (zoomed-out view)
│   ├── RelationshipEdge.tsx     # Custom edge styling
│   └── TreeSearch.tsx           # Search bar with autocomplete
├── auth/
│   ├── LoginPage.tsx            # Email input + magic link trigger
│   ├── PendingPage.tsx          # "Waiting for approval" state
│   └── AuthCallback.tsx         # Magic link redirect handler
├── submission/
│   ├── SubmissionFlow.tsx       # Multi-step form wrapper
│   ├── ProfileForm.tsx          # Name, birth year, photo, bio fields
│   └── RelationshipPicker.tsx   # Select person + relationship type
├── admin/
│   ├── AdminDashboard.tsx       # Pending submissions list
│   ├── SubmissionCard.tsx       # Individual submission review card
│   └── ProfileEditor.tsx       # Edit profile modal
├── hooks/
│   ├── useAuth.ts               # Supabase auth state + access level
│   ├── useFamilyTree.ts         # Fetch + transform tree data for React Flow
│   └── useSubmission.ts         # Submission form state + mutations
└── types.ts                     # Shared TypeScript types
```

## Routes

| Path | Component | Access |
|------|-----------|--------|
| `/family` | FamilyPage | Public (shows login) |
| `/family/auth/callback` | AuthCallback | Public (magic link redirect) |
| `/family/admin` | AdminDashboard | Admin only |

All other states (tree view, submission, pending) are handled within `FamilyPage` based on auth state.

## Dependencies (new)

- `@supabase/supabase-js` — Supabase client
- `@xyflow/react` — Tree visualization (React Flow)

## Environment Variables (new)

- `REACT_APP_SUPABASE_URL` — Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY` — Supabase anonymous/public key

## Supabase Configuration

- **Auth → URL Configuration**: Add `https://<your-domain>/family/auth/callback` as an allowed redirect URL for magic links
- **Auth → Email Templates**: Customize the magic link email template with family tree branding
- **Storage**: Create a `photos` bucket with public read access for profile images

## Out of Scope

- Real-time collaboration / live updates
- Export to GEDCOM or other genealogy formats
- Family tree statistics or analytics
- Multiple family trees per instance
- Notification system beyond email requests
