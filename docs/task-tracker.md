# Task Tracker

> Track implementation progress for the current sprint.

## Current Sprint: Initial Setup

### In Progress
- [ ] Add comprehensive test coverage to reach 90% threshold
  - Branch: `feature/test-coverage`
  - PR: Pending
  - Status: Not Started

### Backlog
- [ ] Implement database migrations system
- [ ] Add Zod validation to all controllers
- [ ] Complete OAuth callback flow for extension
- [ ] Implement Redis caching layer
- [ ] Add E2E tests for critical user flows
- [ ] Fix README install instructions

### Completed
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
  - PR: Pending

---

## Workflow Reminder

1. Pick a task from Backlog, move to In Progress
2. Create feature branch: `git checkout -b feature/task-name`
3. Write tests FIRST (TDD)
4. Implement feature
5. Ensure 90% coverage
6. Create PR: `gh pr create`
7. Wait for reviews, run `/review-and-fix`
8. Merge after CI passes
9. Move task to Completed
