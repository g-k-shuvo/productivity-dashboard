# Technical Debt

This document tracks known technical debt items, prioritized by severity.

## Critical

### 1. Minimal Test Coverage
**Location:** `backend/`, `extension/`
**Issue:** Only 3 test files exist in the entire codebase:
- `backend/src/controllers/__tests__/authController.test.ts`
- `backend/src/services/__tests__/authService.test.ts`
- `extension/src/newtab/components/widgets/__tests__/QuoteWidget.test.tsx`

**Current State:**
- Tests pass (Jest configs and mock paths fixed)
- Coverage threshold set to 90% but actual coverage is far below
- E2E testing infrastructure added (Playwright) but minimal tests

**Impact:** No automated testing safety net for refactoring or new features.

**Recommendation:**
1. Add unit tests for all services (target: 90% coverage)
2. Add integration tests for API routes
3. Add component tests for critical widgets
4. Expand E2E tests for critical user flows

---

### 2. No Database Migrations
**Location:** `backend/src/config/database.ts`
**Issue:** Database uses `synchronize: true` in development, which auto-syncs schema changes. No migration files exist in `src/migrations/`.

**Risk:**
- Data loss during schema changes
- No rollback capability
- Production deployment requires manual schema management

**Recommendation:**
1. Disable `synchronize` in all environments
2. Generate initial migration from current schema
3. Add migration scripts to CI/CD pipeline
4. Document migration workflow

---

### 3. ~~CONTRIBUTING.md References `develop` Branch~~
**Location:** `CONTRIBUTING.md:37`
**Status:** ✅ FIXED
**Resolution:** Updated to reference `main` branch and simplified install instructions.

---

## High

### 4. OAuth Callback Flow Incomplete
**Location:** `backend/src/controllers/authController.ts`
**Issue:** OAuth callbacks redirect to hardcoded URLs. No proper token delivery mechanism for the Chrome extension.

**Current Flow:**
1. Extension opens OAuth popup
2. Backend authenticates with provider
3. Backend redirects to success/failure page
4. **Gap:** No mechanism to pass tokens back to extension

**Recommendation:**
- Implement postMessage API for token delivery
- Or use chrome.identity API for extension OAuth
- Add proper callback URL configuration

---

### 5. Redis Configured But Unused
**Location:** `backend/src/config/env.ts`
**Issue:** Redis configuration exists but is never used:
- Rate limiting uses in-memory store (resets on restart)
- Session uses default memory store
- No caching layer implemented

**Impact:**
- Rate limits reset on server restart
- Memory pressure from session storage
- Repeated expensive API calls (Unsplash, Weather)

**Recommendation:**
1. Add `ioredis` dependency
2. Configure rate limiter with Redis store
3. Add response caching for external APIs
4. Consider Redis for session storage

---

### 6. ~~README Install Instructions Redundant~~
**Location:** `README.md:44-49`
**Status:** ✅ FIXED
**Resolution:** Simplified to just `npm install` with explanation that workspaces handle packages.

---

## Medium

### 7. Minimal E2E Tests
**Location:** `tests/e2e/`
**Issue:** Playwright infrastructure added but only health check test exists. Critical user flows are untested:
- OAuth login flow
- Subscription checkout flow
- Widget interactions
- Data synchronization

**Current State:**
- Playwright configured with CI integration
- Only `health.spec.ts` exists

**Recommendation:**
1. Create test accounts for OAuth providers
2. Use Stripe test mode for payment flows
3. Add E2E tests for critical flows (auth, checkout, sync)

---

### 8. No Zod Validation in Controllers
**Location:** `backend/src/controllers/*.ts`
**Issue:** CLAUDE.md specifies "Validate input with Zod on backend" but controllers don't use Zod schemas. Request bodies are passed directly to services without validation.

**Example (taskController.ts):**
```typescript
// Current: No validation
const task = await taskService.createTask(req.body);

// Should be:
const validated = createTaskSchema.parse(req.body);
const task = await taskService.createTask(validated);
```

**Recommendation:**
1. Create Zod schemas for all request DTOs
2. Add validation middleware or validate in controllers
3. Return 400 with specific validation errors

---

### 9. `as any` Type Casts in Routes
**Location:** Multiple route files
**Issue:** Several route handlers use `as any` to bypass TypeScript checks, indicating type definition gaps.

**Examples:**
- Route handlers cast `req` to `any` to access custom properties
- Service returns cast to `any` before sending response

**Recommendation:**
1. Create proper `AuthRequest` interface extending Express.Request
2. Define response DTOs for type-safe responses
3. Remove all `as any` casts

---

## Low

### 10. Inconsistent Error Handling
**Location:** `backend/src/services/*.ts`
**Issue:** Some services throw custom errors, others throw generic `Error`, and some return `null` for not-found cases.

**Recommendation:**
- Define custom error classes (NotFoundError, ValidationError, etc.)
- Consistent error throwing across all services
- Map to appropriate HTTP status codes in errorHandler

---

### 11. No Request Logging
**Location:** `backend/src/app.ts`
**Issue:** No request/response logging middleware. Only errors are logged.

**Recommendation:**
- Add Morgan or custom middleware for request logging
- Log: method, path, status code, response time
- Exclude sensitive data from logs

---

### 12. Hardcoded Quotes
**Location:** `backend/src/services/quotesService.ts`
**Issue:** Quotes are hardcoded in the service file (20 quotes). No ability to add/remove quotes without code changes.

**Recommendation:**
- Move quotes to database or JSON file
- Add admin endpoint for quote management (if needed)
- Or integrate with external quotes API

---

### 13. No API Versioning Headers
**Location:** `backend/src/app.ts`
**Issue:** API version is in URL (`/api/v1/`) but no version headers are set. Makes it harder to track API versions in logs and debugging.

**Recommendation:**
- Add `X-API-Version` response header
- Include version in error responses

---

## Tracking

| Item | Priority | Effort | Status |
|------|----------|--------|--------|
| Minimal test coverage | Critical | High | In Progress |
| No database migrations | Critical | Medium | Open |
| CONTRIBUTING.md branch ref | Critical | Low | Fixed |
| OAuth callback incomplete | High | Medium | Open |
| Redis unused | High | Medium | Open |
| README install instructions | High | Low | Fixed |
| Minimal E2E tests | Medium | High | In Progress |
| No Zod validation | Medium | Medium | Open |
| `as any` casts | Medium | Low | Open |
| Inconsistent errors | Low | Medium | Open |
| No request logging | Low | Low | Open |
| Hardcoded quotes | Low | Low | Open |
| No API version headers | Low | Low | Open |

---

## Contributing

When adding new debt items:
1. Assign a priority (Critical/High/Medium/Low)
2. Note the affected location(s)
3. Describe the issue and impact
4. Provide a recommendation
5. Add to the tracking table
