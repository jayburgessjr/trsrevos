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
