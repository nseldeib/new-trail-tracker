# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Trail Tracker is a Next.js 15.5.9 application for tracking outdoor adventures and fitness goals. Built with React 19, TypeScript, and Supabase for authentication and data storage. The app uses shadcn/ui components with Tailwind CSS for styling.

## Development Commands

### Core Commands
```bash
npm run dev        # Start development server on http://localhost:3000
npm run build      # Build production bundle
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Package Management
This project uses `pnpm` as the package manager (indicated by `pnpm-lock.yaml`).

## Architecture

### Tech Stack
- **Framework**: Next.js 15.5.9 with App Router
- **React**: React 19 with Server Components (RSC enabled)
- **TypeScript**: Strict mode enabled
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth with SSR support
- **UI**: shadcn/ui components + Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: react-hook-form with Zod validation
- **Icons**: lucide-react

### Project Structure

```
app/
├── auth/               # Authentication pages (signin, signup)
├── dashboard/          # Protected dashboard routes
│   ├── workouts/       # Workout tracking pages
│   ├── goals/          # Goal management pages
│   └── page.tsx        # Dashboard home
├── layout.tsx          # Root layout with AuthProvider
├── globals.css         # Global styles and CSS variables
└── page.tsx            # Landing page

components/
├── ui/                 # shadcn/ui base components
├── auth-provider.tsx   # Authentication context and hooks
├── dashboard-layout.tsx # Dashboard shell with navigation
├── workout-form.tsx    # Workout creation/editing form
├── workouts-view.tsx   # Workout list display
├── goal-form.tsx       # Goal creation/editing form
└── goals-view.tsx      # Goal list display

lib/
├── supabase/
│   ├── client.ts       # Browser client (createBrowserClient)
│   ├── server.ts       # Server client (createServerClient)
│   └── middleware.ts   # Session refresh middleware
└── utils.ts            # Utility functions (cn, etc.)

scripts/                # SQL migration scripts for Supabase
```

### Supabase Configuration

#### Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Client Initialization Patterns
- **Client Components**: Use `createClient()` from `@/lib/supabase/client`
- **Server Components**: Use `await createClient()` from `@/lib/supabase/server`
- **Middleware**: Session refresh handled in `middleware.ts` for all routes

#### Database Schema

**workouts table**:
- `id` (UUID, PK)
- `user_id` (UUID, FK to auth.users)
- `activity_type` (TEXT, NOT NULL) - Enum: running, climbing, hiking, snowboarding, cycling, swimming, yoga, strength
- `title` (TEXT, NOT NULL)
- `description` (TEXT)
- `duration_minutes` (INTEGER)
- `distance` (DECIMAL)
- `elevation_gain` (INTEGER)
- `difficulty` (TEXT) - Enum: Easy, Moderate, Hard, Expert
- `location` (TEXT)
- `notes` (TEXT)
- `date` (DATE, NOT NULL)
- `created_at` (TIMESTAMP)

**goals table**:
- `id` (UUID, PK)
- `user_id` (UUID, FK to auth.users)
- `title` (TEXT, NOT NULL)
- `description` (TEXT)
- `activity_type` (TEXT)
- `target_value` (DECIMAL)
- `current_value` (DECIMAL)
- `unit` (TEXT)
- `target_date` (DATE)
- `is_completed` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

**Row Level Security (RLS)**: Enabled on both tables. Users can only CRUD their own records (filtered by `auth.uid() = user_id`).

### Authentication Flow

1. **AuthProvider** (client component) wraps entire app in `app/layout.tsx`
2. Provides global auth context: `user`, `loading`, `signIn`, `signUp`, `signOut`, `signInAsDemo`
3. Pages check auth status with `useAuth()` hook
4. Unauthenticated users redirected to `/auth/signin`
5. Demo account available: `demo@workouttracker.com` / `demo123456`

### UI Component System

This project uses **shadcn/ui** with the following configuration:
- Base color: neutral
- CSS variables for theming (supports dark mode via `class` strategy)
- Custom green color palette for brand (teal-green tones)
- Path aliases: `@/components`, `@/lib`, `@/ui`
- Icon library: lucide-react

To add new shadcn components, follow the existing pattern in `components/ui/`.

### Form Patterns

Forms use `react-hook-form` with Zod for validation:
1. Define form schema with Zod
2. Use `useForm` with `@hookform/resolvers/zod`
3. Handle validation errors in UI
4. Submit to Supabase with proper error handling

Example: See `components/workout-form.tsx` for reference implementation.

### Routing & Navigation

- **App Router** (Next.js 15)
- Protected routes in `/dashboard/*` check auth status in page components
- Use `useRouter()` from `next/navigation` for client-side navigation
- Navigation tabs in `DashboardLayout` show active state based on `usePathname()`

### Middleware

`middleware.ts` runs on all routes (except static assets) to:
- Refresh Supabase session from cookies
- Update session cookies for continued authentication
- Enabled via matcher pattern in `config.matcher`

### Styling Conventions

- Tailwind CSS with custom CSS variables defined in `app/globals.css`
- Green/teal brand color palette (green-50 through green-900)
- Responsive design with mobile-first approach
- Background: `bg-green-50` for dashboard pages
- Use `cn()` utility from `@/lib/utils` for conditional classes

## Database Migrations

SQL migration scripts are in `scripts/` directory:
- Run these directly in Supabase SQL Editor
- Pattern: Create tables → Enable RLS → Create policies → Create indexes
- Notable scripts:
  - `migrate-workouts-table-fixed.sql` - Workouts table structure
  - `migrate-goals-table-fixed.sql` - Goals table structure
  - `create-demo-user-and-data-final-fixed.sql` - Demo account setup

## Build Configuration

`next.config.mjs` has:
- ESLint disabled during builds (`ignoreDuringBuilds: true`)
- TypeScript errors ignored during builds (`ignoreBuildErrors: true`)
- Image optimization disabled (`unoptimized: true`)

These settings allow deployment despite warnings but should be addressed in development.

## Key Development Patterns

### Adding a New Feature

1. Create database table/columns in Supabase (use migration scripts as reference)
2. Enable RLS and create policies for user-specific data access
3. Create TypeScript interface matching table schema
4. Add page in `app/dashboard/[feature]/page.tsx`
5. Create form component in `components/[feature]-form.tsx`
6. Create view component in `components/[feature]-view.tsx`
7. Add navigation link in `components/dashboard-layout.tsx`

### Data Fetching Pattern

```typescript
const supabase = createClient()
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .order('created_at', { ascending: false })

if (error) throw error
```

### Protected Page Pattern

```typescript
const { user, loading: authLoading } = useAuth()

useEffect(() => {
  if (authLoading) return
  if (!user) {
    router.push("/auth/signin")
    return
  }
  // Fetch data
}, [user, authLoading, router])
```

## Path Aliases

TypeScript path mapping (`tsconfig.json`):
- `@/*` → Root directory
- Examples: `@/components`, `@/lib/supabase/client`, `@/app`

## Automated Architectural Documentation (Claude Rules via CodeYam)

This project uses significant documentation stored as Claude Rules (`.claude/rules`).
It is your responsibility to add to, update, and improve this documentation.
We focus on three categories of documentation:

1. Architecture
   - Any time there is a specific relationship between files please capture the architecture
   - Note how the files relate, how data flows, and how changes should be approached

2. Testing
   - For complex areas of the app where both manual and automated testing is complex track:
     - Helpful commands used in debugging and testing
     - Where test files are located if it is not obvious (and the command to run them if not obvious)

3. FAQ
   - If you are ever confused about something that does not fit into the above categories document it here.
   - Anything you have to figure out or ask the user about should be captured here.

During each development session modify and add appropriate rules to track anything that is at all confusing.
Ask clarifying questions to ensure you are not documenting anything inaccurate.
After each development session review and improve all appropriate rules to ensure they are accurate, concise, and up-to-date.
Always focus on positive instructions explaining how it works, what to run, where to find things, etc in concise terms. Do not add warnings unless necessary. Do not state anything obvious.
All rules must be as concise as possible. Look for opportunities to improve how concise it is worded. We want to minimize the impact on the context window.
When adding a new rules document see `.codeyam/rules/instructions.md` for instructions on where to create the rule and the format to use.
