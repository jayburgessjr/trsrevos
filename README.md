# TRS Internal SaaS (Scaffold Reset)

This repository has been reset to a minimal Next.js 14 scaffold that renders the TRS Copilot preview using only dummy data and lightweight UI primitives. The goal is to provide clean starting point code while keeping the original visual design.

## Stack
- Next.js 14 + React 18
- TypeScript
- Tailwind CSS utility classes
- Local shadcn-style UI components (button, card, tabs, etc.)

## Getting Started
```bash
pnpm install
pnpm dev
```

## Additional Commands
```bash
pnpm build     # production build
pnpm start     # run the production server locally
pnpm lint      # eslint over the scaffold
pnpm typecheck # run TypeScript in no-emit mode
pnpm format    # format files with Prettier
```

## Project Layout
- `app/` – Next.js App Router entry point with a single page of mocked TRS data.
- `components/ui/` – basic headless UI primitives used by the scaffold.
- `styles/` – Tailwind configuration surface.

Everything else has been removed so new modules, data fetching, and auth flows can be rebuilt from scratch.

## Gmail Workspace Integration

The settings wizard at `/settings/integrations` now provisions a Google OAuth flow so users can connect their Gmail Workspace
account and manage mail inside TRSREVOS. To enable the feature locally, configure the following environment variables:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | Public URL where the app is hosted (used to construct the OAuth callback). |
| `GOOGLE_CLIENT_ID` | OAuth client ID generated from Google Cloud Console. |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret from Google Cloud Console. |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Required so the API routes can read/write the Supabase project with the signed-in user context. |

Ensure the Gmail API is enabled for the Google Cloud project and the OAuth consent screen is configured to request the
`https://www.googleapis.com/auth/gmail.modify` and `https://www.googleapis.com/auth/userinfo.email` scopes.
