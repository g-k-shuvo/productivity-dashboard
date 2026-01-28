# Productivity Dashboard (Momentum Chrome Extension)

## Stack
- **Monorepo**: npm workspaces (`backend/`, `extension/`)
- **Backend**: Node.js, Express, TypeScript, TypeORM, PostgreSQL, Zod, Passport (Google/GitHub OAuth), Stripe, Winston logger
- **Extension**: Chrome Extension (Manifest V3), React 18, Vite, Zustand, Axios, date-fns
- **Testing**: Jest (both packages), @testing-library/react (extension), supertest (backend)
- **Linting**: ESLint + TypeScript parser
- **Formatting**: Prettier

## Commands
| Action | Command |
|---|---|
| Install all | `npm install` (root, workspaces auto-resolve) |
| Dev backend | `npm run dev:backend` |
| Dev extension | `npm run dev:extension` |
| Build backend | `npm run build:backend` |
| Build extension | `npm run build:extension` |
| Test backend | `npm run test:backend` |
| Test extension | `npm run test:extension` |
| Test backend coverage | `cd backend && npm run test:coverage` |
| Lint all | `npm run lint` |
| Lint fix backend | `cd backend && npm run lint:fix` |
| Lint fix extension | `cd extension && npm run lint:fix` |
| Typecheck backend | `cd backend && npm run typecheck` |
| Typecheck extension | `cd extension && npm run typecheck` |
| Format | `npm run format` |

## Project Structure
```
productivity-dashboard/
├── backend/          # Express API server
│   └── src/
│       ├── config/   # database, logger
│       ├── middleware/# errorHandler, notFound, rateLimiter
│       ├── models/   # User, RefreshToken, Subscription (TypeORM)
│       └── routes/   # users
├── extension/        # Chrome extension (React + Vite)
│   └── src/
│       ├── background/   # service worker
│       ├── newtab/       # main new tab page (App, widgets, store)
│       ├── settings/     # settings page
│       └── shared/       # api service, storage utils
├── database/         # DB scripts/migrations
├── docker/           # Docker config
└── docs/             # Documentation
```

## Repo Rules
- Node >= 18, npm >= 9
- Never read `.env` or `secrets/` files
- All DB queries use TypeORM (parameterized)
- Validate input with Zod on backend
- State management via Zustand on extension

## Feature-first workflow (mandatory)
- **Documentation First**: Every change must be tied to a Feature Spec located at `docs/features/<feature-slug>.md`.
- **Planning**: The Planning phase must involve creating or updating the Feature Spec (defining objective, scope, impacted files, data model, test plan, and rollout).
- **Execution**: Code generation and test creation must explicitly reference requirements defined in the Feature Spec.
- **Branching Strategy**: Use the naming convention `feature/<short_meaningful_name>`.
- **Git Operations**: Use the `gh` CLI for all GitHub operations (PR creation, comments, status checks).

## GitHub Workflow Conventions
- Branch naming: `feature/<slug>`
- PR creation: `gh pr create`
- PR checks: `gh pr checks`
- PR comments: `gh pr comment`
- Always work in PR flow — never commit directly to main/master
