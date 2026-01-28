# Engineering Notes

> Living document for technical decisions, learnings, and context.

## Architecture Decisions

### ADR-001: Monorepo with npm Workspaces
**Date:** 2024-01-28
**Status:** Accepted

**Context:**
Need to manage backend and extension code in a unified way while keeping them deployable independently.

**Decision:**
Use npm workspaces with separate packages for backend and extension.

**Consequences:**
- Single `npm install` at root handles all dependencies
- Shared tooling configuration (ESLint, Prettier)
- Independent versioning per package
- Requires careful dependency management

---

### ADR-002: TypeORM with PostgreSQL
**Date:** 2024-01-28
**Status:** Accepted

**Context:**
Need a robust ORM for backend database operations with TypeScript support.

**Decision:**
Use TypeORM with PostgreSQL.

**Consequences:**
- Strong TypeScript integration with decorators
- Migration support (needs to be implemented)
- Currently using `synchronize: true` in dev (should migrate to proper migrations)

---

### ADR-003: Zustand for Extension State
**Date:** 2024-01-28
**Status:** Accepted

**Context:**
Need lightweight state management for Chrome extension that works with React.

**Decision:**
Use Zustand with Chrome storage persistence.

**Consequences:**
- Minimal boilerplate compared to Redux
- Easy persistence to chrome.storage.local
- No provider wrapper needed

---

## Technical Debt Log

| ID | Description | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| TD-001 | Replace synchronize:true with migrations | Critical | M | Open |
| TD-002 | Add Zod validation to controllers | Medium | M | Open |
| TD-003 | Implement Redis caching | High | L | Open |
| TD-004 | Fix OAuth callback for extension | High | M | Open |
| TD-005 | Remove `as any` type casts | Medium | S | Open |
| TD-006 | Add request logging middleware | Low | S | Open |

---

## Patterns & Conventions

### Backend Patterns
- **Controllers**: Thin, delegate to services
- **Services**: Business logic, return typed responses
- **Models**: TypeORM entities with decorators
- **Middleware**: Express middleware for cross-cutting concerns
- **Validation**: Use Zod schemas (to be implemented)

### Frontend Patterns
- **Components**: Functional React with hooks
- **State**: Zustand stores in `store/` directory
- **API calls**: Centralized in `shared/services/api.ts`
- **Storage**: Use `shared/utils/storage.ts` wrapper

---

## Learnings & Gotchas

### 2024-01-28: Jest Configuration
- Backend tests must be in `src/**/__tests__/` not a separate `tests/` folder
- Extension mock paths count from the test file location
- `identity-obj-proxy` required for CSS imports in Jest

### 2024-01-28: TypeScript in Extension
- Need `@types/node` for `process` and `NodeJS` types
- Index signatures must match optional property types (`boolean | undefined`)
- Unused variables cause errors with `noUnusedLocals: true`

---

## Security Considerations

### Implemented
- [x] Helmet.js for HTTP security headers
- [x] CORS configuration
- [x] Rate limiting (100/15min API, 5/15min auth)
- [x] JWT with short expiry (15min) + refresh tokens
- [x] TypeORM parameterized queries

### Planned
- [ ] Input validation with Zod on all endpoints
- [ ] Request logging for audit trail
- [ ] HTTPS enforcement in production

---

## References
- [TypeORM Documentation](https://typeorm.io/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Playwright Documentation](https://playwright.dev/)
