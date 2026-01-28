# Task Tracker

> Track implementation progress for the current feature/sprint.

## Current Sprint: [Sprint Name]

### In Progress
- [ ] Task description here
  - Branch: `feature/task-name`
  - PR: #XX
  - Status: In Review

### Completed
- [x] Example completed task
  - Branch: `feature/example`
  - PR: #1 (Merged)

### Blocked
- [ ] Blocked task description
  - Blocker: Description of what's blocking

---

## Task Template

```markdown
- [ ] **Task Title**
  - Description: What needs to be done
  - Branch: `feature/branch-name`
  - PR: #XX
  - Tests: [ ] Unit [ ] Integration [ ] E2E
  - Acceptance Criteria:
    - [ ] Criterion 1
    - [ ] Criterion 2
```

## Workflow

1. Create task entry in "In Progress"
2. Create feature branch: `git checkout -b feature/task-name`
3. Implement with TDD (write tests first)
4. Create PR: `gh pr create`
5. Wait for reviews (Gemini/Jetrix)
6. Run `/review-and-fix` to address comments
7. Merge and move task to "Completed"
