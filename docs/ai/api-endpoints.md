# API Endpoints

Base URL: `/api/v1`

## Authentication

All authenticated endpoints require `Authorization: Bearer <token>` header.

Pro features require an active subscription (checked via `requirePro` middleware).

## Route Groups

| Group | Base Path | Auth | Pro | Description |
|-------|-----------|------|-----|-------------|
| Auth | `/auth` | Partial | No | OAuth login, token refresh |
| Users | `/users` | Yes | No | User profile |
| Images | `/images` | No | No | Unsplash background images |
| Weather | `/weather` | No | No | Weather data |
| Quotes | `/quotes` | No | No | Inspirational quotes |
| Subscriptions | `/subscriptions` | Yes | No | Subscription management |
| Stripe | `/stripe` | Mixed | No | Payment processing |
| Sync | `/sync` | Yes | Yes | Cross-device sync |
| Files | `/files` | Yes | Yes | File uploads |
| Tasks | `/tasks` | Yes | Yes | Task management |
| Habits | `/habits` | Yes | Yes | Habit tracking |
| Metrics | `/metrics` | Yes | Yes | Analytics |
| Workspaces | `/workspaces` | Yes | Yes | Workspace management |
| AI | `/ai` | Yes | Yes | AI conversations |
| Integrations | `/integrations` | Yes | Yes | Third-party integrations |
| Pomodoro | `/pomodoro` | Yes | Yes | Pomodoro timer |
| Countdowns | `/countdowns` | Yes | Yes | Countdown timers |
| TabStash | `/tabstash` | Yes | Yes | Tab collections |

---

## Health Check

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Server health check |

**Response:**
```json
{ "status": "ok", "timestamp": "2024-01-15T10:30:00.000Z" }
```

---

## Auth Routes (`/api/v1/auth`)

| Method | Path | Auth | Rate Limit | Description |
|--------|------|------|------------|-------------|
| GET | `/google` | No | 5/15min | Initiate Google OAuth |
| GET | `/google/callback` | No | 5/15min | Google OAuth callback |
| GET | `/github` | No | 5/15min | Initiate GitHub OAuth |
| GET | `/github/callback` | No | 5/15min | GitHub OAuth callback |
| GET | `/failure` | No | - | OAuth failure handler |
| POST | `/refresh` | No | 5/15min | Refresh access token |
| POST | `/logout` | Yes | - | Logout (revoke tokens) |

### POST `/refresh`
**Request:**
```json
{ "refreshToken": "string" }
```
**Response:**
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 900
}
```

---

## Users Routes (`/api/v1/users`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/me` | Yes | Get current user profile |
| PUT | `/me` | Yes | Update user profile |

### GET `/me`
**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "avatarUrl": "https://...",
  "provider": "google",
  "createdAt": "timestamp"
}
```

### PUT `/me`
**Request:**
```json
{
  "name": "string",
  "avatarUrl": "string"
}
```

---

## Images Routes (`/api/v1/images`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/daily` | No | Get daily background image |
| GET | `/search` | No | Search images |

### GET `/search`
**Query Params:** `query`, `page`, `perPage`
**Response:**
```json
{
  "results": [
    {
      "id": "string",
      "urls": { "regular": "string", "small": "string" },
      "user": { "name": "string", "username": "string" }
    }
  ],
  "total": 100,
  "totalPages": 10
}
```

---

## Weather Routes (`/api/v1/weather`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/current` | No | Current weather |
| GET | `/forecast` | No | 5-day forecast |

### GET `/current`
**Query Params:** `lat`, `lon`
**Response:**
```json
{
  "temperature": 22,
  "feelsLike": 21,
  "humidity": 65,
  "windSpeed": 3.5,
  "condition": "Clear",
  "description": "clear sky",
  "icon": "☀️",
  "city": "London",
  "country": "GB"
}
```

---

## Quotes Routes (`/api/v1/quotes`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/daily` | No | Get daily quote |
| GET | `/random` | No | Get random quote |

**Response:**
```json
{
  "text": "The only way to do great work is to love what you do.",
  "author": "Steve Jobs",
  "category": "motivation"
}
```

---

## Subscriptions Routes (`/api/v1/subscriptions`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Yes | Get subscription details |
| GET | `/check` | Yes | Check active subscription |
| POST | `/cancel` | Yes | Cancel subscription |

### GET `/`
**Response:**
```json
{
  "id": "uuid",
  "status": "active",
  "plan": "pro",
  "currentPeriodStart": "timestamp",
  "currentPeriodEnd": "timestamp",
  "cancelAtPeriodEnd": false
}
```

### GET `/check`
**Response:**
```json
{ "hasActiveSubscription": true, "plan": "pro" }
```

---

## Stripe Routes (`/api/v1/stripe`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/checkout` | Yes | Create checkout session |
| POST | `/webhook` | No* | Handle Stripe webhooks |
| GET | `/success` | No | Checkout success redirect |
| GET | `/cancel` | No | Checkout cancel redirect |

*Webhook uses Stripe signature verification instead of JWT auth.

### POST `/checkout`
**Request:**
```json
{ "priceId": "string" }
```
**Response:**
```json
{ "sessionId": "string", "url": "string" }
```

---

## Sync Routes (`/api/v1/sync`) - Pro

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Yes | Sync data |
| GET | `/` | Yes | Get all synced data |
| GET | `/:dataType` | Yes | Get specific data type |
| DELETE | `/:dataType` | Yes | Delete synced data |

### POST `/`
**Request:**
```json
{
  "dataType": "focus",
  "data": { ... },
  "version": 1,
  "workspaceId": "uuid (optional)"
}
```
**Response:**
```json
{
  "id": "uuid",
  "dataType": "focus",
  "data": { ... },
  "version": 2
}
```

---

## Files Routes (`/api/v1/files`) - Pro

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/upload` | Yes | Upload file |
| GET | `/` | Yes | List user files |
| GET | `/:fileId` | Yes | Get file details |
| DELETE | `/:fileId` | Yes | Delete file |

### POST `/upload`
**Request:** `multipart/form-data` with `file` field
**Response:**
```json
{
  "id": "uuid",
  "fileName": "image.png",
  "filePath": "/uploads/...",
  "fileType": "png",
  "fileSize": 12345,
  "mimeType": "image/png"
}
```

---

## Tasks Routes (`/api/v1/tasks`) - Pro

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Yes | Create task |
| GET | `/` | Yes | List tasks |
| GET | `/:taskId` | Yes | Get task |
| PUT | `/:taskId` | Yes | Update task |
| DELETE | `/:taskId` | Yes | Delete task |
| PATCH | `/:taskId/toggle` | Yes | Toggle completion |

### POST `/`
**Request:**
```json
{
  "title": "string",
  "description": "string",
  "priority": "low|medium|high",
  "dueDate": "timestamp",
  "category": "string",
  "tags": ["string"],
  "parentTaskId": "uuid",
  "workspaceId": "uuid"
}
```

### GET `/`
**Query Params:** `workspaceId`, `completed`, `priority`, `category`

---

## Habits Routes (`/api/v1/habits`) - Pro

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Yes | Create habit |
| GET | `/` | Yes | List habits |
| GET | `/:habitId` | Yes | Get habit |
| PUT | `/:habitId` | Yes | Update habit |
| DELETE | `/:habitId` | Yes | Delete habit |
| POST | `/:habitId/checkin` | Yes | Check in for date |
| GET | `/:habitId/entries` | Yes | Get habit entries |
| GET | `/:habitId/streak` | Yes | Get current streak |

### POST `/`
**Request:**
```json
{
  "name": "string",
  "description": "string",
  "color": "#FF5733",
  "workspaceId": "uuid"
}
```

### POST `/:habitId/checkin`
**Request:**
```json
{
  "date": "2024-01-15",
  "completed": true,
  "notes": "string"
}
```

### GET `/:habitId/streak`
**Response:**
```json
{ "currentStreak": 7, "longestStreak": 14 }
```

---

## Metrics Routes (`/api/v1/metrics`) - Pro

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Yes | Create metric |
| GET | `/` | Yes | List metrics |
| GET | `/stats` | Yes | Get metric statistics |
| GET | `/daily` | Yes | Get daily metrics |
| DELETE | `/:metricId` | Yes | Delete metric |

### POST `/`
**Request:**
```json
{
  "metricType": "tasks_completed",
  "value": 5,
  "date": "2024-01-15",
  "metadata": { ... },
  "workspaceId": "uuid"
}
```

### GET `/stats`
**Query Params:** `metricType`, `startDate`, `endDate`
**Response:**
```json
{
  "total": 150,
  "average": 5.2,
  "min": 0,
  "max": 12
}
```

---

## Workspaces Routes (`/api/v1/workspaces`) - Pro

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Yes | Create workspace |
| GET | `/` | Yes | List workspaces |
| GET | `/:workspaceId` | Yes | Get workspace |
| PUT | `/:workspaceId` | Yes | Update workspace |
| DELETE | `/:workspaceId` | Yes | Delete workspace |

### POST `/`
**Request:**
```json
{
  "name": "string",
  "isDefault": false
}
```

---

## AI Routes (`/api/v1/ai`) - Pro

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/conversations` | Yes | Create conversation |
| GET | `/conversations` | Yes | List conversations |
| GET | `/conversations/:id` | Yes | Get conversation |
| POST | `/conversations/:id/message` | Yes | Send message |
| DELETE | `/conversations/:id` | Yes | Delete conversation |
| POST | `/summarize` | Yes | Generate summary |
| POST | `/organize` | Yes | Suggest organization |

### POST `/conversations`
**Request:**
```json
{
  "type": "notes|chat",
  "title": "string",
  "workspaceId": "uuid"
}
```

### POST `/conversations/:id/message`
**Request:**
```json
{
  "content": "string",
  "provider": "openai|anthropic"
}
```
**Response:**
```json
{
  "message": {
    "role": "assistant",
    "content": "string",
    "timestamp": "timestamp"
  },
  "usage": {
    "promptTokens": 100,
    "completionTokens": 50,
    "totalTokens": 150
  }
}
```

### POST `/summarize`
**Request:**
```json
{ "content": "string" }
```

---

## Integrations Routes (`/api/v1/integrations`) - Pro

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Yes | Add integration |
| GET | `/` | Yes | List integrations |
| GET | `/:id` | Yes | Get integration |
| PUT | `/:id` | Yes | Update integration |
| DELETE | `/:id` | Yes | Remove integration |
| POST | `/:id/sync` | Yes | Sync tasks |

### POST `/`
**Request:**
```json
{
  "service": "todoist|asana|clickup",
  "accessToken": "string",
  "refreshToken": "string",
  "metadata": { ... }
}
```

---

## Pomodoro Routes (`/api/v1/pomodoro`) - Pro

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Yes | Create session |
| GET | `/` | Yes | List sessions |
| PATCH | `/:sessionId/start` | Yes | Start session |
| PATCH | `/:sessionId/complete` | Yes | Complete session |
| GET | `/stats` | Yes | Get statistics |

### POST `/`
**Request:**
```json
{
  "duration": 25,
  "type": "work|short_break|long_break",
  "taskId": "uuid",
  "workspaceId": "uuid"
}
```

### GET `/stats`
**Query Params:** `startDate`, `endDate`
**Response:**
```json
{
  "totalSessions": 50,
  "completedSessions": 45,
  "totalFocusMinutes": 1125,
  "averageSessionsPerDay": 3.5
}
```

---

## Countdowns Routes (`/api/v1/countdowns`) - Pro

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Yes | Create countdown |
| GET | `/` | Yes | List countdowns |
| GET | `/:id` | Yes | Get countdown |
| PUT | `/:id` | Yes | Update countdown |
| DELETE | `/:id` | Yes | Delete countdown |

### POST `/`
**Request:**
```json
{
  "name": "string",
  "targetDate": "timestamp",
  "notifyBefore": 60,
  "workspaceId": "uuid"
}
```

---

## TabStash Routes (`/api/v1/tabstash`) - Pro

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Yes | Create stash |
| GET | `/` | Yes | List stashes |
| GET | `/:id` | Yes | Get stash |
| PUT | `/:id` | Yes | Update stash |
| DELETE | `/:id` | Yes | Delete stash |

### POST `/`
**Request:**
```json
{
  "name": "string",
  "tabs": [
    { "url": "string", "title": "string", "favIconUrl": "string" }
  ],
  "workspaceId": "uuid"
}
```

---

## Error Responses

All endpoints return errors in a consistent format:

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "statusCode": 400
  }
}
```

**Common Status Codes:**
| Code | Description |
|------|-------------|
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (no Pro subscription) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |
