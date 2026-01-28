# Task Tracker

> Track implementation progress for the current sprint.
> See `docs/ai/feature-gap-analysis.md` for full feature comparison.

## Current Sprint: Feature Completion

### In Progress
*(Move tasks here when starting work)*

---

### Backlog - High Priority (Free Features)

- [ ] **Wire Background Image System to Frontend**
  - Connect Unsplash service to new tab page
  - Display daily background image with fade-in animation
  - Add semi-transparent dark overlay (40% opacity)
  - Cache image URL in local storage
  - Implement fallback gradient if API fails
  - Tests: Integration test for image loading

- [ ] **Add Photo Credits Display**
  - Show photo location (bottom-left): "📍 Location"
  - Show photographer credit (bottom-right): "📷 Name"
  - Link to photographer profile on Unsplash
  - Only show when background image is loaded
  - Tests: Component test for credit display

- [ ] **Add Daily Mantra Widget**
  - Create `MantraWidget.tsx` with motivational phrases
  - Backend endpoint `/api/v1/mantras/daily` with rotation
  - Position: Bottom-left corner
  - Hardcoded fallback array of 50+ mantras
  - Tests: Unit test for mantra rotation

---

### Backlog - High Priority (Plus Features)

- [ ] **Implement Focus Mode**
  - Add focus mode toggle button on dashboard
  - When active: Hide links, weather, quotes, todos panel
  - Show only: Time, current focus task, exit button
  - Keyboard shortcut: Ctrl/Cmd + Shift + F
  - Add blur/dim background option
  - Tests: E2E test for focus mode toggle

- [ ] **Add Dark Mode Theme**
  - Implement theme toggle in settings (Light/Dark/Auto)
  - CSS variables for theme colors
  - Auto mode follows system preference
  - Persist preference in local storage
  - Apply to all widgets and settings panel
  - Tests: Visual regression test

- [ ] **Add Custom Quotes UI**
  - Allow users to add personal quotes with author
  - Mix custom quotes with daily curated quotes
  - Add favorite/pin functionality for quotes
  - Skip quote button (loads next)
  - Store custom quotes in local storage
  - Tests: CRUD tests for custom quotes

- [ ] **Implement Multiple Todo Lists**
  - Refactor TodoWidget to support multiple lists
  - Add list creation, rename, delete
  - List tabs at top of todo panel
  - Drag tasks between lists
  - Add due date picker for tasks
  - Add priority levels (Low/Medium/High/Urgent)
  - Tests: Unit tests for list operations

---

### Backlog - Medium Priority

- [ ] **Implement Onboarding Flow**
  - First-run welcome screen
  - Ask for user's name
  - Brief feature tour (skippable)
  - Set initial preferences (location, time format)
  - Show tooltips on first dashboard view
  - Tests: E2E test for onboarding completion

- [ ] **Add Keyboard Shortcuts**
  - `Ctrl/Cmd + K`: Focus search bar
  - `Escape`: Close any open panel
  - `T`: Toggle todo panel
  - `S`: Open settings
  - `Ctrl/Cmd + Shift + F`: Focus mode (Plus)
  - Display shortcut hints in UI
  - Tests: Unit tests for shortcut handlers

- [ ] **Add Browser Notifications**
  - Request notification permission
  - Pomodoro timer completion notifications
  - Daily focus reminder (configurable morning time)
  - Countdown approaching notifications
  - Settings toggle to enable/disable
  - Tests: Mock notification API tests

- [ ] **Implement Stripe Checkout Flow**
  - Create checkout session endpoint
  - Redirect to Stripe checkout
  - Handle success/cancel redirects
  - Update subscription status on webhook
  - Add customer portal link for management
  - Tests: Integration test with Stripe test mode

---

### Backlog - Lower Priority

- [ ] **Add Balance Mode**
  - Set downtime hours in settings (e.g., 6 PM - 9 AM)
  - During downtime: Hide focus, todos, metrics
  - Show only: Time, greeting, photo, quote
  - Visual indicator when balance mode active
  - Tests: Unit test for time-based logic

- [ ] **Implement Link Groups**
  - Group links into folders
  - One-click open all links in group
  - Drag links into groups
  - Import/export link collections
  - Tests: CRUD tests for link groups

- [ ] **Add Autofocus Mode**
  - Connect todo list to daily focus
  - Auto-populate next task when current completed
  - Show progress (3 of 10 tasks)
  - Skip task option
  - Tests: Integration test for task cycling

- [ ] **Implement Advanced Weather**
  - Hourly forecast (next 24 hours)
  - 7-day forecast view
  - Additional data: humidity, wind, UV, air quality
  - Multiple saved locations
  - Tests: API integration tests

---

### Backlog - Technical Debt

- [ ] Add comprehensive test coverage to reach 90% threshold
- [ ] Implement database migrations system (replace synchronize:true)
- [ ] Add Zod validation to all controllers
- [ ] Complete OAuth callback flow for extension
- [ ] Implement Redis caching layer
- [ ] Add E2E tests for critical user flows
- [ ] Fix ESM compatibility issue for E2E tests (uuid package)
- [ ] Remove all `as any` type casts

---

### Completed

- [x] **Add Greeting Widget**
  - Created `GreetingWidget.tsx` with time-based greeting
  - Added name editing on click with local storage persistence
  - Added `greeting` toggle in settings (enabled by default)
  - Position: Above dashboard-top-row (above clock)
  - Files: `greetingUtils.ts`, `GreetingWidget.tsx`, `GreetingWidget.css`
  - Tests: 100% coverage (22 unit tests + 16 component tests)
  - Branch: `feature/implement-task-HkdpY`

- [x] Fix test configurations (Jest roots, mock paths)
  - Branch: `feature/onboarding-docs`
  - PR: #1 (Merged)

- [x] Fix TypeScript errors in extension
  - Branch: `main`
  - Commit: 0d1e490

- [x] Add AI baseline documentation
  - Branch: `feature/onboarding-docs`
  - PR: #1 (Merged)

- [x] Set up dev workflow (Playwright, coverage thresholds, templates)
  - Branch: `feature/dev-workflow-setup`
  - PR: #2 (Merged)

- [x] Fix lint errors (unused imports, underscore prefixes)
  - Branch: `feature/dev-workflow-setup`
  - PR: #2 (Merged)

- [x] Fix README and CONTRIBUTING.md install instructions
  - Branch: `feature/dev-workflow-setup`
  - PR: #2 (Merged)

- [x] Create feature gap analysis document
  - File: `docs/ai/feature-gap-analysis.md`

---

## Dev-Loop Task Format

When the dev-loop picks a task, it should:

1. **Read this file** to find the next un-implemented item
2. **Create a feature branch**: `git checkout -b feature/<task-slug>`
3. **Write tests FIRST** (TDD approach)
4. **Implement the feature** following existing patterns
5. **Run all tests**: `npm run test:all`
6. **Create PR**: `gh pr create`
7. **Mark task completed** in this file

### Task Selection Priority
1. High Priority Free Features (user-facing, no auth required)
2. High Priority Plus Features (require subscription)
3. Medium Priority (enhancements)
4. Technical Debt (maintenance)

---

## Quick Stats

| Category | Total | Done | In Progress | Backlog |
|----------|-------|------|-------------|---------|
| Free Features | 4 | 1 | 0 | 3 |
| Plus Features | 4 | 0 | 0 | 4 |
| Medium Priority | 4 | 0 | 0 | 4 |
| Lower Priority | 4 | 0 | 0 | 4 |
| Technical Debt | 8 | 0 | 0 | 8 |
| **Total** | **24** | **1** | **0** | **23** |
