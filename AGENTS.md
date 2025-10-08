# Repository Guidelines

## Project Structure & Module Organization
The app follows Next.js 14’s `app/` router. UI shells live in `app/`, shared widgets in `components/`, and global styles in `styles/`. Domain copy, dashboards, and support docs reside in `docs/`. Scenario-driven unit tests live in `tests/`, while browser flows sit in `tests-e2e/`. Keep assets (icons, CSVs, mocks) close to the feature that owns them to avoid a sprawling global bucket; `app/(segment)` folders are the preferred place for feature-specific dependencies.

## Build, Test & Development Commands
Use `pnpm install` or `make bootstrap` once per machine. `pnpm dev` starts the Next.js dev server on port 3000, and `pnpm build` performs the release build. `pnpm start` serves the production bundle locally. Quality gates: `pnpm lint` runs ESLint with the Next.js preset, `pnpm typecheck` surfaces TypeScript drift, `pnpm test` executes the Vitest suite headlessly, and `pnpm e2e` triggers Playwright. Add `--update-snapshots` sparingly when touching Golden state.

## Coding Style & Naming Conventions
We rely on Prettier (configured via `pnpm format`) for 2-space indentation, single quotes, and trailing commas. React components should be typed function components in PascalCase, files in `app/` should prefer nested folders that mirror route segments (`app/agents/page.tsx`). Hooks live under `components/hooks/` and are prefixed with `use`. When adding Tailwind utility classes, group by layout → color → typography for readability. Run ESLint before submitting to catch accessibility and import-order violations.

## Testing Guidelines
Unit and integration tests live beside domain contexts in `tests/`, follow `*.spec.ts` naming, and use Vitest with MSW for API seams. Keep render helpers in `tests/utils/`. End-to-end specs live in `tests-e2e/` and follow `*.e2e.ts`. Use Playwright fixtures to authenticate or stub TRS Score states; do not reach out to external services. Maintain meaningful coverage of governance gates and agent workflows—new features should include at least one Vitest spec plus an e2e path if they alter user flows.

## Commit & Pull Request Guidelines
Commits favor short, imperative subjects (`feat: add copilot dashboard layout`, `fix: resolve build regressions`). Group related changes and avoid “misc cleanup” buckets. Every PR should include: summary of the change, test evidence (`pnpm test`, `pnpm e2e` when relevant), screenshots for UI shifts, and linked issues or Slack threads. Keep PRs focused on a single feature or bug to ease review. Request review from the TRS Copilot core team and ensure preview deployments are green before merging. Continuous integration treats lint + tests as blocking.
