# Data Model

## Entity Relationship Diagram

```
                                    ┌─────────────────┐
                                    │      User       │
                                    │─────────────────│
                                    │ id (PK)         │
                                    │ email           │
                                    │ name            │
                                    │ avatarUrl       │
                                    │ provider        │
                                    │ providerId      │
                                    │ createdAt       │
                                    │ updatedAt       │
                                    └────────┬────────┘
                                             │
         ┌───────────────────┬───────────────┼───────────────┬───────────────────┐
         │                   │               │               │                   │
         ▼                   ▼               ▼               ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  RefreshToken   │ │  Subscription   │ │   Workspace     │ │  Integration    │ │   FileUpload    │
│─────────────────│ │─────────────────│ │─────────────────│ │─────────────────│ │─────────────────│
│ id (PK)         │ │ id (PK)         │ │ id (PK)         │ │ id (PK)         │ │ id (PK)         │
│ userId (FK)     │ │ userId (FK)     │ │ userId (FK)     │ │ userId (FK)     │ │ userId (FK)     │
│ token           │ │ stripeSubId     │ │ name            │ │ service         │ │ workspaceId (FK)│
│ expiresAt       │ │ stripeCustomerId│ │ isDefault       │ │ accessToken     │ │ fileName        │
│ createdAt       │ │ status          │ │ createdAt       │ │ refreshToken    │ │ filePath        │
└─────────────────┘ │ plan            │ │ updatedAt       │ │ tokenExpiresAt  │ │ fileType        │
                    │ periodStart     │ └────────┬────────┘ │ metadata        │ │ fileSize        │
                    │ periodEnd       │          │          │ createdAt       │ │ mimeType        │
                    │ cancelAtEnd     │          │          │ updatedAt       │ │ metadata        │
                    └─────────────────┘          │          └─────────────────┘ │ createdAt       │
                                                 │                              └─────────────────┘
    ┌────────────────────────────────────────────┼────────────────────────────────────────────┐
    │                    │                       │                       │                    │
    ▼                    ▼                       ▼                       ▼                    ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│     Task        │ │     Habit       │ │    Metric       │ │   SyncData      │ │ AIConversation  │
│─────────────────│ │─────────────────│ │─────────────────│ │─────────────────│ │─────────────────│
│ id (PK)         │ │ id (PK)         │ │ id (PK)         │ │ id (PK)         │ │ id (PK)         │
│ userId (FK)     │ │ userId (FK)     │ │ userId (FK)     │ │ userId (FK)     │ │ userId (FK)     │
│ workspaceId (FK)│ │ workspaceId (FK)│ │ workspaceId (FK)│ │ workspaceId (FK)│ │ workspaceId (FK)│
│ parentTaskId(FK)│ │ name            │ │ metricType      │ │ dataType        │ │ type            │
│ title           │ │ description     │ │ value           │ │ data            │ │ title           │
│ description     │ │ color           │ │ date            │ │ version         │ │ messages        │
│ completed       │ │ createdAt       │ │ metadata        │ │ createdAt       │ │ createdAt       │
│ priority        │ │ updatedAt       │ │ createdAt       │ │ updatedAt       │ │ updatedAt       │
│ dueDate         │ └────────┬────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
│ category        │          │
│ tags            │          ▼
│ position        │ ┌─────────────────┐      ┌─────────────────┐ ┌─────────────────┐
│ createdAt       │ │   HabitEntry    │      │ PomodoroSession │ │ CountdownTimer  │
│ updatedAt       │ │─────────────────│      │─────────────────│ │─────────────────│
└─────────────────┘ │ id (PK)         │      │ id (PK)         │ │ id (PK)         │
        │           │ habitId (FK)    │      │ userId (FK)     │ │ userId (FK)     │
        │           │ date            │      │ workspaceId (FK)│ │ workspaceId (FK)│
        ▼           │ completed       │      │ taskId (FK)     │ │ name            │
┌─────────────────┐ │ notes           │      │ duration        │ │ targetDate      │
│   TabStash      │ │ createdAt       │      │ type            │ │ notifyBefore    │
│─────────────────│ └─────────────────┘      │ completed       │ │ createdAt       │
│ id (PK)         │                          │ startedAt       │ │ updatedAt       │
│ userId (FK)     │                          │ completedAt     │ └─────────────────┘
│ workspaceId (FK)│                          │ createdAt       │
│ name            │                          └─────────────────┘
│ tabs            │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
```

## Entity Definitions

### User
Authentication and profile data for users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| email | VARCHAR | UNIQUE, NOT NULL | User's email address |
| name | VARCHAR | NULLABLE | Display name |
| avatarUrl | VARCHAR | NULLABLE | Profile picture URL |
| provider | VARCHAR | NOT NULL | OAuth provider: 'google', 'github', 'email' |
| providerId | VARCHAR | NULLABLE | ID from OAuth provider |
| createdAt | TIMESTAMP | auto | Creation timestamp |
| updatedAt | TIMESTAMP | auto | Last update timestamp |

**Relations:**
- One-to-Many → RefreshToken
- One-to-Many → Subscription
- One-to-Many → Workspace
- One-to-Many → Integration

---

### RefreshToken
JWT refresh tokens for session management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| userId | UUID | FK → User | Token owner |
| token | VARCHAR | NOT NULL | Refresh token string |
| expiresAt | TIMESTAMP WITH TZ | NOT NULL | Expiration time |
| createdAt | TIMESTAMP | auto | Creation timestamp |

**Relations:**
- Many-to-One → User (CASCADE delete)

---

### Subscription
Stripe subscription tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| userId | UUID | FK → User | Subscription owner |
| stripeSubscriptionId | VARCHAR | UNIQUE, NULLABLE | Stripe subscription ID |
| stripeCustomerId | VARCHAR | NULLABLE | Stripe customer ID |
| status | VARCHAR | NOT NULL | 'active', 'canceled', 'past_due', etc. |
| plan | VARCHAR | NOT NULL | 'pro', 'premium' |
| currentPeriodStart | TIMESTAMP WITH TZ | NULLABLE | Billing period start |
| currentPeriodEnd | TIMESTAMP WITH TZ | NULLABLE | Billing period end |
| cancelAtPeriodEnd | BOOLEAN | DEFAULT false | Cancellation pending |
| createdAt | TIMESTAMP | auto | Creation timestamp |
| updatedAt | TIMESTAMP | auto | Last update timestamp |

**Relations:**
- Many-to-One → User (CASCADE delete)

---

### Workspace
User workspaces for organizing content.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| userId | UUID | FK → User | Workspace owner |
| name | VARCHAR | NOT NULL | Workspace name |
| isDefault | BOOLEAN | DEFAULT false | Default workspace flag |
| createdAt | TIMESTAMP | auto | Creation timestamp |
| updatedAt | TIMESTAMP | auto | Last update timestamp |

**Relations:**
- Many-to-One → User (CASCADE delete)
- One-to-Many → Task, Habit, Metric, SyncData, TabStash, PomodoroSession, CountdownTimer, AIConversation, FileUpload

---

### Task
Task management with subtask hierarchy.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| userId | UUID | FK → User | Task owner |
| workspaceId | UUID | FK → Workspace, NULLABLE | Associated workspace |
| parentTaskId | UUID | FK → Task, NULLABLE | Parent task for subtasks |
| title | VARCHAR(500) | NOT NULL | Task title |
| description | TEXT | NULLABLE | Task description |
| completed | BOOLEAN | DEFAULT false | Completion status |
| priority | VARCHAR | DEFAULT 'medium' | 'low', 'medium', 'high' |
| dueDate | TIMESTAMP WITH TZ | NULLABLE | Due date |
| category | VARCHAR(100) | NULLABLE | Task category |
| tags | TEXT[] | DEFAULT [] | Array of tags |
| position | INTEGER | DEFAULT 0 | Sort order |
| createdAt | TIMESTAMP | auto | Creation timestamp |
| updatedAt | TIMESTAMP | auto | Last update timestamp |

**Relations:**
- Many-to-One → User (CASCADE delete)
- Many-to-One → Workspace (CASCADE delete)
- Many-to-One → Task (self-reference, CASCADE delete)
- One-to-Many → Task (subtasks)
- One-to-Many → PomodoroSession

---

### Habit
Habit definitions for tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| userId | UUID | FK → User | Habit owner |
| workspaceId | UUID | FK → Workspace, NULLABLE | Associated workspace |
| name | VARCHAR | NOT NULL | Habit name |
| description | TEXT | NULLABLE | Habit description |
| color | VARCHAR(7) | NULLABLE | Hex color code |
| createdAt | TIMESTAMP | auto | Creation timestamp |
| updatedAt | TIMESTAMP | auto | Last update timestamp |

**Relations:**
- Many-to-One → User (CASCADE delete)
- Many-to-One → Workspace (CASCADE delete)
- One-to-Many → HabitEntry

---

### HabitEntry
Daily habit check-ins.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| habitId | UUID | FK → Habit | Associated habit |
| date | DATE | NOT NULL | Entry date |
| completed | BOOLEAN | DEFAULT false | Completion status |
| notes | TEXT | NULLABLE | Optional notes |
| createdAt | TIMESTAMP | auto | Creation timestamp |

**Constraints:**
- UNIQUE(habitId, date)

**Relations:**
- Many-to-One → Habit (CASCADE delete)

---

### Metric
Custom metrics and analytics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| userId | UUID | FK → User | Metric owner |
| workspaceId | UUID | FK → Workspace, NULLABLE | Associated workspace |
| metricType | VARCHAR(50) | NOT NULL | 'tasks_completed', 'focus_time', etc. |
| value | DECIMAL(10,2) | NULLABLE | Metric value |
| date | DATE | NOT NULL | Metric date |
| metadata | JSONB | NULLABLE | Additional data |
| createdAt | TIMESTAMP | auto | Creation timestamp |

**Relations:**
- Many-to-One → User (CASCADE delete)
- Many-to-One → Workspace (CASCADE delete)

---

### SyncData
Cross-device data synchronization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| userId | UUID | FK → User | Data owner |
| workspaceId | UUID | FK → Workspace, NULLABLE | Associated workspace |
| dataType | VARCHAR(50) | NOT NULL | 'focus', 'links', 'settings', etc. |
| data | JSONB | NOT NULL | Synchronized data |
| version | INTEGER | DEFAULT 1 | Version for conflict resolution |
| createdAt | TIMESTAMP | auto | Creation timestamp |
| updatedAt | TIMESTAMP | auto | Last update timestamp |

**Relations:**
- Many-to-One → User (CASCADE delete)
- Many-to-One → Workspace (CASCADE delete)

---

### TabStash
Saved browser tab collections.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| userId | UUID | FK → User | Stash owner |
| workspaceId | UUID | FK → Workspace, NULLABLE | Associated workspace |
| name | VARCHAR | NOT NULL | Stash name |
| tabs | JSONB | NOT NULL | Array of {url, title, favIconUrl?} |
| createdAt | TIMESTAMP | auto | Creation timestamp |
| updatedAt | TIMESTAMP | auto | Last update timestamp |

**Relations:**
- Many-to-One → User (CASCADE delete)
- Many-to-One → Workspace (CASCADE delete)

---

### PomodoroSession
Pomodoro timer sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| userId | UUID | FK → User | Session owner |
| workspaceId | UUID | FK → Workspace, NULLABLE | Associated workspace |
| taskId | UUID | FK → Task, NULLABLE | Linked task |
| duration | INTEGER | NOT NULL | Duration in minutes |
| type | VARCHAR(20) | NOT NULL | 'work', 'short_break', 'long_break' |
| completed | BOOLEAN | DEFAULT false | Completion status |
| startedAt | TIMESTAMP WITH TZ | NULLABLE | Session start time |
| completedAt | TIMESTAMP WITH TZ | NULLABLE | Session end time |
| createdAt | TIMESTAMP | auto | Creation timestamp |

**Relations:**
- Many-to-One → User (CASCADE delete)
- Many-to-One → Workspace (CASCADE delete)
- Many-to-One → Task (SET NULL on delete)

---

### CountdownTimer
Countdown timers for events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| userId | UUID | FK → User | Timer owner |
| workspaceId | UUID | FK → Workspace, NULLABLE | Associated workspace |
| name | VARCHAR | NOT NULL | Timer name |
| targetDate | TIMESTAMP WITH TZ | NOT NULL | Target date/time |
| notifyBefore | INTEGER | NULLABLE | Minutes before to notify |
| createdAt | TIMESTAMP | auto | Creation timestamp |
| updatedAt | TIMESTAMP | auto | Last update timestamp |

**Relations:**
- Many-to-One → User (CASCADE delete)
- Many-to-One → Workspace (CASCADE delete)

---

### Integration
Third-party service integrations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| userId | UUID | FK → User | Integration owner |
| service | VARCHAR(50) | NOT NULL | 'todoist', 'asana', 'clickup', etc. |
| accessToken | TEXT | NOT NULL | OAuth access token |
| refreshToken | TEXT | NULLABLE | OAuth refresh token |
| tokenExpiresAt | TIMESTAMP WITH TZ | NULLABLE | Token expiration |
| metadata | JSONB | NULLABLE | Service-specific metadata |
| createdAt | TIMESTAMP | auto | Creation timestamp |
| updatedAt | TIMESTAMP | auto | Last update timestamp |

**Relations:**
- Many-to-One → User (CASCADE delete)

---

### AIConversation
AI chat history.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| userId | UUID | FK → User | Conversation owner |
| workspaceId | UUID | FK → Workspace, NULLABLE | Associated workspace |
| type | VARCHAR(50) | NOT NULL | 'notes', 'chat' |
| title | VARCHAR(255) | NULLABLE | Conversation title |
| messages | JSONB | NOT NULL | Array of {role, content, timestamp} |
| createdAt | TIMESTAMP | auto | Creation timestamp |
| updatedAt | TIMESTAMP | auto | Last update timestamp |

**Relations:**
- Many-to-One → User (CASCADE delete)
- Many-to-One → Workspace (CASCADE delete)

---

### FileUpload
Uploaded file metadata.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| userId | UUID | FK → User | File owner |
| workspaceId | UUID | FK → Workspace, NULLABLE | Associated workspace |
| fileName | VARCHAR(255) | NOT NULL | Original file name |
| filePath | TEXT | NOT NULL | Storage path |
| fileType | VARCHAR(100) | NULLABLE | File type/extension |
| fileSize | BIGINT | NULLABLE | File size in bytes |
| mimeType | VARCHAR(100) | NULLABLE | MIME type |
| metadata | JSONB | NULLABLE | Additional metadata |
| createdAt | TIMESTAMP | auto | Creation timestamp |

**Relations:**
- Many-to-One → User (CASCADE delete)
- Many-to-One → Workspace (CASCADE delete)
