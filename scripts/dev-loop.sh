#!/bin/bash
#
# dev-loop.sh - Automated development loop for implementing tasks
#
# Usage:
#   ./scripts/dev-loop.sh                    # Run once
#   ./scripts/dev-loop.sh --iterations 5     # Run 5 iterations
#   ./scripts/dev-loop.sh --dry-run          # Preview without executing
#   ./scripts/dev-loop.sh --verbose          # Detailed output
#

set -uo pipefail

# === Configuration ===
ITERATIONS=1
DRY_RUN=false
VERBOSE=false
BRANCH_PREFIX="feature/implement-task"

# Implementation prompt
IMPLEMENTATION_PROMPT='Pick any un-implemented item from docs/templates/task-tracker.md or implementation-plan.md and implement it fully.

Follow the TDD workflow:
1. Write tests first
2. Implement the feature
3. Ensure 90% coverage

CRITICAL RULES:
- Always work in a feature branch
- Write tests BEFORE implementation
- Run all tests before committing
- Never skip the review step'

REVIEW_COMMAND='/review-and-fix'

# Claude flags
CLAUDE_FLAGS="--permission-mode bypassPermissions --no-session-persistence --verbose"

# === Colors ===
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# === Helper Functions ===

log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "\n${CYAN}=== $1 ===${NC}"
}

verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${YELLOW}[VERBOSE]${NC} $1"
    fi
}

generate_id() {
    cat /dev/urandom | tr -dc 'A-Za-z0-9' | head -c 5
}

has_changes() {
    ! git diff --quiet 2>/dev/null || \
    ! git diff --cached --quiet 2>/dev/null || \
    [ -n "$(git ls-files --others --exclude-standard 2>/dev/null)" ]
}

run_claude_implementation() {
    local prompt="$1"
    local exit_code=0

    verbose "Running Claude Code for implementation..."

    local output
    output=$(claude $CLAUDE_FLAGS -p "$prompt" 2>&1) || exit_code=$?

    if [ ${#output} -gt 2000 ]; then
        echo "${output: -2000}"
    else
        echo "$output"
    fi

    if has_changes; then
        log_success "Implementation made changes to the codebase"
        return 0
    else
        if [ $exit_code -ne 0 ]; then
            log_error "Claude failed with no changes made"
            return 1
        else
            log_warning "No changes made"
            return 1
        fi
    fi
}

run_claude_review() {
    local command="$1"
    local exit_code=0

    verbose "Running Claude Code for review..."

    local output
    output=$(claude $CLAUDE_FLAGS -p "$command" 2>&1) || exit_code=$?

    if [ ${#output} -gt 2000 ]; then
        echo "${output: -2000}"
    else
        echo "$output"
    fi

    if [ $exit_code -eq 0 ]; then
        log_success "Review completed successfully"
        return 0
    else
        log_warning "Review completed with warnings"
        return 0
    fi
}

show_help() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS]

Automated development loop for implementing tasks.

Options:
    --iterations N    Run N iterations (default: 1)
    --dry-run         Show what would be done without executing
    --verbose         Show detailed output
    --help            Show this help message

Workflow per iteration:
    1. Create a new branch from main
    2. Run Claude Code to implement a task
    3. Create a PR using gh CLI
    4. Run /review-and-fix command
    5. Auto-merge after CI passes

Examples:
    $(basename "$0")                    # Run once
    $(basename "$0") --iterations 5     # Run 5 iterations
    $(basename "$0") --dry-run          # Preview mode
EOF
}

check_prerequisites() {
    log "Checking prerequisites..."

    local missing=()

    if ! command -v claude &> /dev/null; then
        missing+=("claude")
    fi

    if ! command -v gh &> /dev/null; then
        missing+=("gh")
    fi

    if ! command -v git &> /dev/null; then
        missing+=("git")
    fi

    if [ ${#missing[@]} -ne 0 ]; then
        log_error "Missing required tools: ${missing[*]}"
        return 1
    fi

    if ! gh auth status &> /dev/null; then
        log_error "GitHub CLI not authenticated. Run 'gh auth login' first."
        return 1
    fi

    if ! git rev-parse --git-dir &> /dev/null; then
        log_error "Not in a git repository"
        return 1
    fi

    log_success "All prerequisites met"
    return 0
}

# === Main Loop Function ===

run_iteration() {
    local iteration=$1
    local id=$(generate_id)
    local branch="${BRANCH_PREFIX}-${id}"
    local PR_NUMBER=""
    local PR_URL=""

    log_step "Iteration $iteration: Starting"

    # Step 1: Setup Branch
    log_step "Step 1: Setup Branch ($branch)"

    if [ "$DRY_RUN" = true ]; then
        log "[DRY-RUN] Would checkout main and pull"
        log "[DRY-RUN] Would create branch: $branch"
    else
        verbose "Checking out main..."
        git checkout main || { log_error "Failed to checkout main"; return 1; }

        verbose "Pulling latest changes..."
        git pull origin main || { log_error "Failed to pull from origin"; return 1; }

        verbose "Creating branch: $branch"
        git checkout -b "$branch" || { log_error "Failed to create branch"; return 1; }
    fi

    # Step 2: Implementation
    log_step "Step 2: Run Claude Code for Implementation"

    if [ "$DRY_RUN" = true ]; then
        log "[DRY-RUN] Would run: claude $CLAUDE_FLAGS -p \"$IMPLEMENTATION_PROMPT\""
    else
        if ! run_claude_implementation "$IMPLEMENTATION_PROMPT"; then
            if has_changes; then
                log_warning "Claude reported error but changes were made. Continuing..."
            else
                log_error "Implementation failed with no changes"
                log_warning "Cleaning up branch '$branch'..."
                git checkout main
                git branch -D "$branch" 2>/dev/null || true
                return 1
            fi
        fi
    fi

    # Step 3: Create PR
    log_step "Step 3: Create PR"

    if [ "$DRY_RUN" = true ]; then
        log "[DRY-RUN] Would stage all changes"
        log "[DRY-RUN] Would commit with message"
        log "[DRY-RUN] Would push to origin"
        log "[DRY-RUN] Would create PR"
    else
        if ! has_changes; then
            log_warning "No changes to commit. Skipping this iteration."
            git checkout main
            git branch -D "$branch" 2>/dev/null || true
            return 0
        fi

        verbose "Staging all changes..."
        git add -A

        verbose "Creating commit..."
        git commit -m "Implement task from tracker

Automated implementation via dev-loop.sh

Co-Authored-By: Claude <noreply@anthropic.com>" || { log_error "Failed to commit"; return 1; }

        verbose "Pushing to origin..."
        git push -u origin "$branch" || { log_error "Failed to push"; return 1; }

        verbose "Creating PR..."
        PR_URL=$(gh pr create --fill --base main) || { log_error "Failed to create PR"; return 1; }
        PR_NUMBER=$(echo "$PR_URL" | grep -oE '[0-9]+$')

        log_success "PR created: $PR_URL (PR #$PR_NUMBER)"
    fi

    # Step 4: Wait for reviews and fix
    log_step "Step 4: Run Review & Fix"
    log "Sleeping for 5 min for automated reviews..."

    if [ "$DRY_RUN" = false ]; then
        sleep 300
    fi

    if [ "$DRY_RUN" = true ]; then
        log "[DRY-RUN] Would run: claude $CLAUDE_FLAGS -p \"$REVIEW_COMMAND\""
    else
        run_claude_review "$REVIEW_COMMAND"

        if has_changes; then
            verbose "Pushing review fixes..."
            git add -A
            git commit -m "Address review feedback

Co-Authored-By: Claude <noreply@anthropic.com>" 2>/dev/null || true
            git push 2>/dev/null || true
            log_success "Review changes pushed"
        else
            log "No additional changes from review"
        fi
    fi

    # Step 5: Merge
    log_step "Step 5: Merge PR"

    if [ "$DRY_RUN" = true ]; then
        log "[DRY-RUN] Would run: gh pr merge --squash"
        log "[DRY-RUN] Would checkout main and pull"
    else
        verbose "Attempting to merge PR #$PR_NUMBER..."
        sleep 10

        local pr_mergeable
        pr_mergeable=$(gh pr view "$PR_NUMBER" --json mergeable -q '.mergeable' 2>/dev/null || echo "UNKNOWN")

        if [ "$pr_mergeable" = "MERGEABLE" ]; then
            if gh pr merge "$PR_NUMBER" --squash 2>/dev/null; then
                log_success "PR #$PR_NUMBER merged successfully!"
            else
                log "Direct merge failed, enabling auto-merge..."
                gh pr merge "$PR_NUMBER" --squash --auto 2>/dev/null || true
            fi
        else
            log "PR not immediately mergeable (state: $pr_mergeable), enabling auto-merge..."
            gh pr merge "$PR_NUMBER" --squash --auto 2>/dev/null || true
        fi

        sleep 5
        local PR_STATE
        PR_STATE=$(gh pr view "$PR_NUMBER" --json state -q '.state' 2>/dev/null || echo "UNKNOWN")

        if [ "$PR_STATE" = "MERGED" ]; then
            log_success "PR #$PR_NUMBER is MERGED!"
        else
            log "PR #$PR_NUMBER state: $PR_STATE (may merge automatically later)"
        fi

        verbose "Returning to main..."
        git checkout main
        git pull origin main 2>/dev/null || true
        git branch -D "$branch" 2>/dev/null || true
    fi

    log_step "Iteration $iteration: Complete"
    return 0
}

# === Parse Arguments ===

while [[ $# -gt 0 ]]; do
    case $1 in
        --iterations)
            ITERATIONS="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# === Entry Point ===

echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║              Dev Loop - Automated Development              ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

log "Configuration:"
log "  Iterations: $ITERATIONS"
log "  Dry Run: $DRY_RUN"
log "  Verbose: $VERBOSE"
echo ""

if [ "$DRY_RUN" = true ]; then
    log_warning "DRY RUN MODE - No changes will be made"
    echo ""
fi

if ! check_prerequisites; then
    exit 1
fi

COMPLETED=0
FAILED=0

for i in $(seq 1 "$ITERATIONS"); do
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    log "Starting iteration $i of $ITERATIONS"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    if run_iteration "$i"; then
        COMPLETED=$((COMPLETED + 1))
        log_success "Iteration $i completed successfully"
    else
        FAILED=$((FAILED + 1))
        log_error "Iteration $i failed. Stopping."
        break
    fi
done

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log_step "Summary"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log "Completed: $COMPLETED"
log "Failed: $FAILED"

if [ $FAILED -eq 0 ]; then
    log_success "All $COMPLETED iterations completed successfully!"
    exit 0
else
    log_error "$FAILED iteration(s) failed"
    exit 1
fi
