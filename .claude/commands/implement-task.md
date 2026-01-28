# Implement Task from Implementation Plan

Implement task **$ARGUMENTS** from the implementation plan following this workflow:

## Step 1: Read the Task
Read `implementation-plan.md` and locate the specified task. Understand:
- What needs to be implemented
- What files need to be created/modified
- What tests are required
- Verification criteria

## Step 2: Explore Existing Patterns
Before implementing, explore the codebase to understand existing patterns:
- For **models**: Look at `backend/src/models/` for TypeORM entity definitions, validation patterns
- For **database operations**: Look at TypeORM repository patterns in the codebase
- For **middleware**: Look at `backend/src/middleware/` for Express middleware patterns
- For **API routes**: Look at `backend/src/routes/` for handler patterns
- For **extension components**: Look at `extension/src/newtab/components/` for React component patterns
- For **state management**: Look at `extension/src/newtab/store/` for Zustand store patterns
- For **tests**: Look at existing `*.test.ts` / `*.spec.ts` files for testing patterns

Use the Task tool with subagent_type=Explore for comprehensive codebase exploration.

## Step 3: Enter Plan Mode
Enter plan mode to design the implementation approach. Create a detailed plan that includes:
- Files to create/modify
- Code structure following existing patterns
- Test cases to implement
- Implementation sequence

Get user approval before proceeding.

## Step 4: Implement with Todo Tracking
Use TaskCreate to create a task list tracking each implementation step:
1. Create any new migration files
2. Create/modify model files with validation
3. Create model unit tests
4. Add API routes/handlers (if applicable)
5. Add integration tests
6. Run all tests to verify

Mark each task as `in_progress` when starting and `completed` when done.

## Step 5: Run Tests
Run the test suite to verify everything works:
```bash
npm run test:backend
npm run test:extension
```

All tests must pass before proceeding.

## Step 6: Update Implementation Plan
Edit `implementation-plan.md` to mark the completed task(s) as done:
- Change `- [ ]` to `- [x]` for completed tasks

## Step 7: Commit and Push
Create a descriptive commit with:
- Summary of what was implemented
- List of key changes
- Co-authored-by trailer

Then push to the current branch.

---

**Important Guidelines:**
- Follow existing code patterns exactly - don't introduce new conventions
- Use TypeORM for all database operations (backend)
- Validate input with Zod on backend
- Use Zustand for state management on extension
- Write comprehensive tests covering happy path, error cases, and edge cases
