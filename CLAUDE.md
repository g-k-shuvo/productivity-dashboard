# Productivity Dashboard (Momentum Chrome Extension)

## Model Requirement
**ALWAYS use Claude Opus 4.5 (claude-opus-4-5-20251101) for this project.**

## Core Workflow Rules

### 1. Always Start with Plan Mode
- Every implementation task MUST begin in Plan Mode
- Create/update specs before writing code
- Get user approval before proceeding with implementation

### 2. Test-Driven Development (90% Coverage)
- **Unit Tests**: Write tests before implementation
- **Integration Tests**: Test API endpoints and database operations
- **E2E Tests (Playwright)**: Test critical user flows
- **Coverage Threshold**: 90% minimum for all metrics (branches, functions, lines, statements)

### 3. Pull Request Workflow (MANDATORY)
1. Create `task-tracker.md` entry with `[ ]` checkbox
2. Create feature branch: `git checkout -b feature/<task-name>`
3. Implement with TDD (tests first)
4. Create PR: `gh pr create`
5. Wait for automated reviews (Gemini-code-assist/Jetrix)
6. Run `/review-and-fix` to address all comments
7. Run `/code-simplifier` for code cleanup
8. Run all tests and push
9. Merge after CI passes

### 4. Required Documentation Files
Maintain these files in `docs/`:
- `docs/templates/task-tracker.md` - Track implementation progress
- `docs/templates/spec.md` - Feature specifications
- `docs/templates/engineering-notes.md` - Technical decisions and learnings
- `docs/templates/implementation-plan.md` - Detailed implementation steps

### 5. Required Plugins
Ensure these plugins are installed:
- `pr-review-toolkit` - For comprehensive PR reviews
- `code-simplifier` - For code cleanup
- `playwright` - For E2E testing

---

## Stack
- **Monorepo**: npm workspaces (`backend/`, `extension/`)
- **Backend**: Node.js, Express, TypeScript, TypeORM, PostgreSQL, Zod, Passport (Google/GitHub OAuth), Stripe, Winston logger
- **Extension**: Chrome Extension (Manifest V3), React 18, Vite, Zustand, Axios, date-fns
- **Testing**: Jest (unit/integration), Playwright (E2E), @testing-library/react, supertest
- **Linting**: ESLint + TypeScript parser
- **Formatting**: Prettier

## Commands
| Action | Command |
|---|---|
| Install all | `npm install` (root, workspaces auto-resolve) |
| Dev backend | `npm run dev:backend` |
| Dev extension | `npm run dev:extension` |
| Build all | `npm run build` |
| Build backend | `npm run build:backend` |
| Build extension | `npm run build:extension` |
| Test backend | `npm run test:backend` |
| Test extension | `npm run test:extension` |
| Test backend coverage | `npm run test:backend:coverage` |
| Test extension coverage | `npm run test:extension:coverage` |
| Test E2E | `npm run test:e2e` |
| Test E2E (UI) | `npm run test:e2e:ui` |
| Test all | `npm run test:all` |
| Lint all | `npm run lint` |
| Lint fix backend | `cd backend && npm run lint:fix` |
| Lint fix extension | `cd extension && npm run lint:fix` |
| Typecheck all | `npm run typecheck` |
| Format | `npm run format` |

## Project Structure
```
productivity-dashboard/
├── backend/          # Express API server
│   └── src/
│       ├── config/   # database, logger
│       ├── middleware/# errorHandler, notFound, rateLimiter
│       ├── models/   # User, RefreshToken, Subscription (TypeORM)
│       └── routes/   # API routes
├── extension/        # Chrome extension (React + Vite)
│   └── src/
│       ├── background/   # service worker
│       ├── newtab/       # main new tab page (App, widgets, store)
│       ├── settings/     # settings page
│       └── shared/       # api service, storage utils
├── tests/
│   └── e2e/          # Playwright E2E tests
├── database/         # DB scripts/migrations
├── docker/           # Docker config
├── docs/
│   ├── ai/           # AI-generated documentation
│   ├── features/     # Feature specifications
│   └── templates/    # Document templates
└── scripts/          # Automation scripts
```

## Repo Rules
- Node >= 18, npm >= 9
- Never read `.env` or `secrets/` files
- All DB queries use TypeORM (parameterized)
- Validate input with Zod on backend
- State management via Zustand on extension
- **Never commit directly to main/master**
- **Always work in feature branches**
- **90% test coverage required**

## Feature-first Workflow (Mandatory)
1. **Documentation First**: Every change must be tied to a Feature Spec located at `docs/features/<feature-slug>.md`
2. **Planning**: Create/update the Feature Spec (objective, scope, impacted files, data model, test plan, rollout)
3. **Task Tracking**: Add task to `task-tracker.md` with checkbox
4. **Branching**: Create branch `feature/<short_meaningful_name>`
5. **TDD**: Write tests first, then implement
6. **PR Flow**: Create PR via `gh pr create`
7. **Review**: Wait for automated reviews, then run `/review-and-fix`
8. **Simplify**: Run code simplifier
9. **Verify**: All tests pass, coverage >= 90%
10. **Merge**: After CI green and reviews addressed

## GitHub Workflow Conventions
- Branch naming: `feature/<slug>`
- PR creation: `gh pr create`
- PR checks: `gh pr checks`
- PR comments: `gh pr comment`
- View PR: `gh pr view`
- Merge PR: `gh pr merge --squash`
- **Always work in PR flow — never commit directly to main/master**
