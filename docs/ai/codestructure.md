# Code Structure

## Repository Layout

```
productivity-dashboard/
├── .claude/                     # Claude Code configuration
│   ├── commands/                # Custom slash commands
│   │   ├── execute.md
│   │   ├── feature-new.md
│   │   ├── implement-task.md
│   │   ├── onboard.md
│   │   ├── plan.md
│   │   ├── pr.md
│   │   ├── pr-comments.md
│   │   ├── refactor.md
│   │   ├── review-and-fix.md
│   │   ├── submit.md
│   │   └── tests.md
│   ├── settings.json            # Shared settings
│   └── settings.local.json      # Local overrides
│
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI pipeline
│
├── .husky/
│   └── pre-commit               # Husky pre-commit hook
│
├── backend/                     # Express API Server
│   ├── src/
│   │   ├── app.ts               # Express app entry point, middleware setup, routes
│   │   ├── config/
│   │   │   ├── database.ts      # TypeORM DataSource configuration
│   │   │   ├── env.ts           # Environment variable loader
│   │   │   ├── logger.ts        # Winston logger setup
│   │   │   └── passport.ts      # Passport OAuth strategies (Google, GitHub)
│   │   ├── controllers/
│   │   │   ├── __tests__/
│   │   │   │   └── authController.test.ts
│   │   │   ├── aiController.ts
│   │   │   ├── authController.ts
│   │   │   ├── countdownController.ts
│   │   │   ├── fileController.ts
│   │   │   ├── habitController.ts
│   │   │   ├── imageController.ts
│   │   │   ├── integrationController.ts
│   │   │   ├── metricsController.ts
│   │   │   ├── pomodoroController.ts
│   │   │   ├── quoteController.ts
│   │   │   ├── stripeController.ts
│   │   │   ├── subscriptionController.ts
│   │   │   ├── syncController.ts
│   │   │   ├── tabstashController.ts
│   │   │   ├── taskController.ts
│   │   │   ├── userController.ts
│   │   │   ├── weatherController.ts
│   │   │   └── workspaceController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts          # JWT verification middleware
│   │   │   ├── errorHandler.ts  # Central error handling
│   │   │   ├── notFound.ts      # 404 handler
│   │   │   ├── proFeature.ts    # Pro subscription check
│   │   │   └── rateLimiter.ts   # Rate limiting (100/15min API, 5/15min auth)
│   │   ├── models/
│   │   │   ├── index.ts         # Re-exports all models
│   │   │   ├── AIConversation.ts
│   │   │   ├── CountdownTimer.ts
│   │   │   ├── FileUpload.ts
│   │   │   ├── Habit.ts
│   │   │   ├── HabitEntry.ts
│   │   │   ├── Integration.ts
│   │   │   ├── Metric.ts
│   │   │   ├── PomodoroSession.ts
│   │   │   ├── RefreshToken.ts
│   │   │   ├── Subscription.ts
│   │   │   ├── SyncData.ts
│   │   │   ├── TabStash.ts
│   │   │   ├── Task.ts
│   │   │   ├── User.ts
│   │   │   └── Workspace.ts
│   │   ├── routes/
│   │   │   ├── ai.ts
│   │   │   ├── auth.ts
│   │   │   ├── countdowns.ts
│   │   │   ├── files.ts
│   │   │   ├── habits.ts
│   │   │   ├── images.ts
│   │   │   ├── integrations.ts
│   │   │   ├── metrics.ts
│   │   │   ├── pomodoro.ts
│   │   │   ├── quotes.ts
│   │   │   ├── stripe.ts
│   │   │   ├── subscriptions.ts
│   │   │   ├── sync.ts
│   │   │   ├── tabstash.ts
│   │   │   ├── tasks.ts
│   │   │   ├── users.ts
│   │   │   ├── weather.ts
│   │   │   └── workspaces.ts
│   │   └── services/
│   │       ├── __tests__/
│   │       │   └── authService.test.ts
│   │       ├── aiService.ts
│   │       ├── authService.ts
│   │       ├── fileStorageService.ts
│   │       ├── quotesService.ts
│   │       ├── stripeService.ts
│   │       ├── subscriptionService.ts
│   │       ├── syncService.ts
│   │       ├── unsplashService.ts
│   │       └── weatherService.ts
│   ├── logs/
│   │   ├── combined.log
│   │   └── error.log
│   ├── .env                     # Environment variables (gitignored)
│   ├── .eslintrc.json
│   ├── jest.config.js
│   ├── nodemon.json
│   ├── package.json
│   └── tsconfig.json
│
├── extension/                   # Chrome Extension
│   ├── public/
│   │   ├── icons/
│   │   │   ├── icon16.png
│   │   │   ├── icon48.png
│   │   │   └── icon128.png
│   │   └── manifest.json        # Manifest V3 configuration
│   ├── src/
│   │   ├── background/
│   │   │   └── index.ts         # Service worker entry
│   │   ├── newtab/
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   │   ├── Dashboard.tsx
│   │   │   │   │   └── Dashboard.css
│   │   │   │   └── widgets/
│   │   │   │       ├── __tests__/
│   │   │   │       │   └── QuoteWidget.test.tsx
│   │   │   │       ├── AskAIWidget.tsx / .css
│   │   │   │       ├── BookmarksWidget.tsx / .css
│   │   │   │       ├── ClockWidget.tsx / .css
│   │   │   │       ├── CountdownWidget.tsx / .css
│   │   │   │       ├── FocusWidget.tsx / .css
│   │   │   │       ├── HabitTrackerWidget.tsx / .css
│   │   │   │       ├── MetricsWidget.tsx / .css
│   │   │   │       ├── NotesAIWidget.tsx / .css
│   │   │   │       ├── PomodoroWidget.tsx / .css
│   │   │   │       ├── QuickLinksWidget.tsx / .css
│   │   │   │       ├── QuoteWidget.tsx / .css
│   │   │   │       ├── SearchWidget.tsx / .css
│   │   │   │       ├── SoundscapesWidget.tsx / .css
│   │   │   │       ├── TabStashWidget.tsx / .css
│   │   │   │       ├── TodoWidget.tsx / .css
│   │   │   │       ├── VisionBoardWidget.tsx / .css
│   │   │   │       ├── WeatherWidget.tsx / .css
│   │   │   │       └── WorldClocksWidget.tsx / .css
│   │   │   ├── store/
│   │   │   │   └── useSettingsStore.ts
│   │   │   ├── styles/
│   │   │   │   └── main.css
│   │   │   ├── App.tsx
│   │   │   ├── index.html
│   │   │   └── main.tsx
│   │   ├── settings/
│   │   │   ├── index.html
│   │   │   ├── main.tsx
│   │   │   ├── SettingsApp.tsx
│   │   │   └── SettingsApp.css
│   │   ├── shared/
│   │   │   ├── services/
│   │   │   │   └── api.ts       # Axios API client
│   │   │   ├── types/
│   │   │   │   └── index.ts     # Shared TypeScript types
│   │   │   └── utils/
│   │   │       ├── proFeature.ts # Pro status checker
│   │   │       └── storage.ts    # Chrome storage utilities
│   │   └── setupTests.ts
│   ├── .eslintrc.json
│   ├── jest.config.js
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
│
├── database/
│   └── schema.sql               # Database schema (reference only)
│
├── docker/
│   ├── docker-compose.yml       # Docker Compose configuration
│   └── Dockerfile.backend       # Backend Docker image
│
├── docs/
│   ├── ai/                      # AI-generated documentation (this folder)
│   ├── features/
│   │   └── README.md            # Feature spec template
│   ├── API.md                   # API documentation
│   ├── DEVELOPMENT.md           # Development guide
│   └── IMPLEMENTATION_STATUS.md # Feature implementation status
│
├── .gitignore
├── .prettierignore
├── .prettierrc
├── CLAUDE.md                    # Claude Code instructions
├── CONTRIBUTING.md              # Contribution guidelines
├── MOMENTUM_EXTENSION_SPEC.md   # Product specification
├── README.md                    # Project README
├── package.json                 # Root package.json (workspaces)
└── package-lock.json
```

## Key Files by Purpose

### Entry Points

| File | Purpose |
|------|---------|
| `backend/src/app.ts` | Express server initialization |
| `extension/src/newtab/main.tsx` | New tab page React entry |
| `extension/src/settings/main.tsx` | Settings page React entry |
| `extension/src/background/index.ts` | Service worker entry |

### Configuration

| File | Purpose |
|------|---------|
| `backend/src/config/env.ts` | Environment variables |
| `backend/src/config/database.ts` | TypeORM DataSource |
| `backend/src/config/passport.ts` | OAuth strategies |
| `extension/public/manifest.json` | Extension manifest |
| `extension/vite.config.ts` | Vite build configuration |

### State Management

| File | Purpose |
|------|---------|
| `extension/src/newtab/store/useSettingsStore.ts` | Zustand settings store |
| `extension/src/shared/utils/storage.ts` | Chrome storage API wrapper |

### API Communication

| File | Purpose |
|------|---------|
| `extension/src/shared/services/api.ts` | Axios client with auth interceptors |
| `extension/src/shared/utils/proFeature.ts` | Pro status checker |

## Widget Components

| Widget | File | Pro Feature |
|--------|------|-------------|
| Clock | `ClockWidget.tsx` | No |
| Quote | `QuoteWidget.tsx` | No |
| Focus | `FocusWidget.tsx` | No |
| Search | `SearchWidget.tsx` | No |
| Quick Links | `QuickLinksWidget.tsx` | No |
| Todo | `TodoWidget.tsx` | No |
| Weather | `WeatherWidget.tsx` | No |
| Bookmarks | `BookmarksWidget.tsx` | No |
| Ask AI | `AskAIWidget.tsx` | Yes |
| Notes AI | `NotesAIWidget.tsx` | Yes |
| Pomodoro | `PomodoroWidget.tsx` | Yes |
| Habit Tracker | `HabitTrackerWidget.tsx` | Yes |
| Metrics | `MetricsWidget.tsx` | Yes |
| Tab Stash | `TabStashWidget.tsx` | Yes |
| Countdown | `CountdownWidget.tsx` | Yes |
| Vision Board | `VisionBoardWidget.tsx` | Yes |
| World Clocks | `WorldClocksWidget.tsx` | Yes |
| Soundscapes | `SoundscapesWidget.tsx` | Yes |
