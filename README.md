# Smart Logo Maker Web

Smart Logo Maker is a Next.js app where a user can:

- create logo inputs step by step
- generate logo results from the LogoAI API
- open any result in a custom editor
- save, favorite, and download logos
- authenticate with email/password or Google using Supabase

## Stack

- `Next.js 16` with App Router
- `React 19`
- `Redux Toolkit` + `redux-persist`
- `Supabase` for auth and logo library persistence
- `Tailwind CSS`
- `Konva / react-konva` for the editor canvas

## Main User Flow

1. User lands on `/`
2. User goes to `/create`
3. Multi-step form stores progress in Redux
4. Final step calls `/api/generate`
5. Results open on `/results`
6. User can favorite, download, or open editor
7. Editor opens on `/editor`
8. Edited logos can be saved or downloaded
9. Saved data is stored in Supabase logo library and cached on client

## Important Routes

- `/`:
  Landing page
- `/create`:
  Multi-step logo input flow
- `/results`:
  Generated logo cards
- `/editor`:
  Full logo editor
- `/favorites`, `/saved`, `/downloads`:
  User logo library pages
- `/auth/signin`, `/auth/signup`, `/auth/forgot-password`:
  Auth screens

## Important Folders

- [`src/app`](/d:/feature/smart-logo-maker-web/src/app)
  App Router pages, API routes, auth routes
- [`src/components`](/d:/feature/smart-logo-maker-web/src/components)
  UI sections, editor UI, auth UI, shared UI
- [`src/lib`](/d:/feature/smart-logo-maker-web/src/lib)
  business logic, storage helpers, Supabase helpers, SVG and download utilities
- [`src/store`](/d:/feature/smart-logo-maker-web/src/store)
  Redux store and logo slice
- [`supabase`](/d:/feature/smart-logo-maker-web/supabase)
  SQL setup and upgrade scripts

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Add environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Start development server:

```bash
npm run dev
```

4. Open:

```text
http://localhost:3000
```

## Supabase Setup

Run one of these SQL files:

- [`supabase/logo_library_schema.sql`](/d:/feature/smart-logo-maker-web/supabase/logo_library_schema.sql)
  Fresh database setup
- [`supabase/logo_library_upgrade.sql`](/d:/feature/smart-logo-maker-web/supabase/logo_library_upgrade.sql)
  Upgrade existing database for favorites, saved, and downloads support

Extra note:

- [`supabase/README.md`](/d:/feature/smart-logo-maker-web/supabase/README.md) explains when to use each SQL file.

## Useful Commands

```bash
npm run dev
npx eslint .
npx tsc --noEmit
```

## Architecture Notes

- Global form state lives in Redux so create flow survives page movement.
- Long-term auth and logo library persistence use Supabase.
- Client-side cache is used for favorites, saved, and downloads to keep UI fast.
- Editor state is composed from reusable hooks so canvas behavior is split into focused modules.

## Documentation For Developers

For full project explanation in Roman English, read:

- [`PROJECT_FLOW_ROMAN_ENGLISH.md`](/d:/feature/smart-logo-maker-web/PROJECT_FLOW_ROMAN_ENGLISH.md)

That file explains:

- project flow
- route flow
- auth flow
- editor flow
- library flow
- important files and why they exist
- how data moves through the app
