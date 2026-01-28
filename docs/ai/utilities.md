# Utilities Reference

## Backend Configuration

### `backend/src/config/env.ts`
Environment variable loader and validation. Exports a `config` object with typed configuration values.

**Configuration Groups:**
- `config.nodeEnv` - 'development' | 'production' | 'test'
- `config.port` - Server port (default: 3000)
- `config.apiUrl` - API base URL
- `config.db.*` - Database configuration
- `config.jwt.*` - JWT settings
- `config.session.secret` - Session secret
- `config.oauth.google.*` - Google OAuth credentials
- `config.oauth.github.*` - GitHub OAuth credentials
- `config.unsplash.accessKey` - Unsplash API key
- `config.openweathermap.apiKey` - Weather API key
- `config.openai.apiKey` - OpenAI API key
- `config.anthropic.apiKey` - Anthropic API key
- `config.stripe.*` - Stripe configuration
- `config.storage.*` - File storage configuration
- `config.redis.*` - Redis configuration

---

### `backend/src/config/database.ts`
TypeORM DataSource configuration.

**Exports:**
- `AppDataSource` - TypeORM DataSource instance
- `initializeDatabase()` - Async function to initialize DB connection

**Configuration:**
- Uses PostgreSQL
- Synchronize enabled in development (auto-creates tables)
- Logging enabled in development
- Entity discovery: `src/models/**/*.{ts,js}`
- Migration path: `src/migrations/**/*.ts`

---

### `backend/src/config/logger.ts`
Winston logger configuration.

**Exports:**
- `logger` - Winston logger instance

**Transports:**
- File: `logs/error.log` (error level only)
- File: `logs/combined.log` (all levels)
- Console (development only, colorized)

**Log Format:**
```
timestamp [level]: message {metadata}
```

---

### `backend/src/config/passport.ts`
Passport.js OAuth strategy configuration.

**Strategies:**
- `GoogleStrategy` - Google OAuth 2.0
- `GitHubStrategy` - GitHub OAuth

**User Serialization:**
- Serializes user ID to session
- Deserializes by fetching user from database

---

## Backend Middleware

### `backend/src/middleware/auth.ts`
JWT authentication middleware.

**Exports:**
- `authenticate` - Express middleware that verifies Bearer token
- `getUserId(req: AuthRequest)` - Helper to extract user ID from request

**Behavior:**
1. Extracts token from `Authorization: Bearer <token>` header
2. Verifies token using `authService.verifyAccessToken()`
3. Attaches user payload to `req.user`
4. Returns 401 if token missing or invalid

**Usage:**
```typescript
router.get('/protected', authenticate, handler);
```

---

### `backend/src/middleware/errorHandler.ts`
Central error handling middleware.

**Exports:**
- `errorHandler` - Express error middleware

**Behavior:**
1. Logs error with metadata (status, path, method, stack)
2. Returns JSON response with error message
3. Hides stack traces in production

**Error Response Format:**
```json
{
  "error": {
    "message": "Error message",
    "statusCode": 500
  }
}
```

---

### `backend/src/middleware/notFound.ts`
404 route handler.

**Exports:**
- `notFound` - Express middleware

**Behavior:**
Creates a `CustomError` with 404 status for unmatched routes.

---

### `backend/src/middleware/rateLimiter.ts`
Rate limiting middleware using `express-rate-limit`.

**Exports:**
- `apiLimiter` - General API rate limiter
- `authLimiter` - Stricter auth route limiter

**Configuration:**
| Limiter | Window | Max Requests |
|---------|--------|--------------|
| apiLimiter | 15 minutes | 100 |
| authLimiter | 15 minutes | 5 |

**Usage:**
```typescript
app.use('/api/', apiLimiter);
router.use('/auth', authLimiter);
```

---

### `backend/src/middleware/proFeature.ts`
Pro subscription verification middleware.

**Exports:**
- `requirePro` - Express middleware

**Behavior:**
1. Extracts user ID from `req.user`
2. Checks subscription via `subscriptionService.hasActiveSubscription()`
3. Returns 403 if no active subscription

**Usage:**
```typescript
router.get('/pro-feature', authenticate, requirePro, handler);
```

---

## Backend Services

### `backend/src/services/authService.ts`
Authentication and token management.

**Methods:**
| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `generateTokenPair` | userId: string | { accessToken, refreshToken, expiresIn } | Creates JWT access + refresh tokens |
| `verifyAccessToken` | token: string | TokenPayload | null | Verifies and decodes access token |
| `verifyRefreshToken` | token: string | TokenPayload | null | Verifies and decodes refresh token |
| `revokeRefreshToken` | token: string | Promise<void> | Deletes refresh token from DB |
| `findOrCreateUser` | profile: OAuthProfile | Promise<User> | Finds existing user or creates new |

---

### `backend/src/services/subscriptionService.ts`
Subscription management.

**Methods:**
| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getActiveSubscription` | userId: string | Promise<Subscription | null> | Gets user's active subscription |
| `hasActiveSubscription` | userId: string | Promise<boolean> | Checks if user has active sub |
| `createSubscription` | data: CreateSubDTO | Promise<Subscription> | Creates subscription record |
| `updateSubscription` | id: string, data: UpdateSubDTO | Promise<Subscription> | Updates subscription |
| `cancelSubscription` | userId: string | Promise<void> | Marks subscription for cancellation |
| `getSubscriptionByStripeId` | stripeId: string | Promise<Subscription | null> | Finds by Stripe ID |

---

### `backend/src/services/stripeService.ts`
Stripe payment integration.

**Methods:**
| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `createCheckoutSession` | userId, email, priceId | Promise<{ sessionId, url }> | Creates Stripe checkout |
| `createCustomer` | email, userId | Promise<Stripe.Customer> | Creates Stripe customer |
| `getSubscription` | subscriptionId | Promise<Stripe.Subscription> | Gets Stripe subscription |
| `cancelSubscription` | subscriptionId | Promise<Stripe.Subscription> | Cancels Stripe subscription |
| `handleWebhook` | payload, signature | Promise<void> | Processes Stripe webhooks |

---

### `backend/src/services/aiService.ts`
AI chat and text processing.

**Methods:**
| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `chatWithOpenAI` | messages, systemPrompt? | Promise<AIResponse> | OpenAI chat completion |
| `chatWithAnthropic` | messages, systemPrompt? | Promise<AIResponse> | Anthropic chat completion |
| `generateNoteSummary` | content | Promise<AIResponse> | Summarize text content |
| `suggestNoteOrganization` | notes | Promise<AIResponse> | Suggest organization |

---

### `backend/src/services/syncService.ts`
Cross-device data synchronization.

**Methods:**
| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `syncData` | userId, dataType, data, version, workspaceId? | Promise<SyncData> | Sync with version control |
| `getData` | userId, dataType, workspaceId? | Promise<SyncData | null> | Get synced data |
| `getAllData` | userId, workspaceId? | Promise<SyncData[]> | Get all synced data |
| `deleteData` | userId, dataType, workspaceId? | Promise<void> | Delete synced data |

**Version Handling:**
- If client version < server version: returns server data
- If client version >= server version: updates server data, increments version

---

### `backend/src/services/unsplashService.ts`
Unsplash image fetching.

**Methods:**
| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getDailyImage` | - | Promise<UnsplashImage> | Random nature/landscape |
| `searchImages` | query, page?, perPage? | Promise<{ results, total, totalPages }> | Search images |

---

### `backend/src/services/weatherService.ts`
OpenWeatherMap integration.

**Methods:**
| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getCurrentWeather` | lat, lon | Promise<WeatherData> | Current weather by coords |
| `getWeatherByCity` | city | Promise<WeatherData> | Current weather by city |
| `getForecast` | lat, lon | Promise<ForecastData> | 5-day forecast |

---

### `backend/src/services/quotesService.ts`
Inspirational quotes (in-memory).

**Methods:**
| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getDailyQuote` | - | Quote | Consistent daily quote |
| `getRandomQuote` | - | Quote | Random quote |
| `getQuoteByCategory` | category | Quote | null | Quote by category |
| `getAllQuotes` | - | Quote[] | All available quotes |

---

### `backend/src/services/fileStorageService.ts`
Local file storage management.

**Methods:**
| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `saveFile` | userId, file, workspaceId? | Promise<FileUpload> | Save uploaded file |
| `getFile` | fileId, userId | Promise<FileUpload | null> | Get file by ID |
| `getUserFiles` | userId, workspaceId? | Promise<FileUpload[]> | List user's files |
| `deleteFile` | fileId, userId | Promise<void> | Delete file |

**Storage Path:** `/uploads/{userId}/{filename}`

---

## Extension Utilities

### `extension/src/shared/services/api.ts`
Axios-based API client.

**Exports:**
- `apiService` - Configured Axios instance
- `setUnauthorizedHandler(handler)` - Set 401 callback

**Configuration:**
- Base URL from environment
- Automatic `Authorization: Bearer` header injection
- 401 response interceptor for token cleanup

**Methods:**
```typescript
apiService.get<T>(url, config?)
apiService.post<T>(url, data?, config?)
apiService.put<T>(url, data?, config?)
apiService.delete<T>(url, config?)
```

---

### `extension/src/shared/utils/storage.ts`
Chrome storage API wrapper.

**Exports:**
```typescript
storage.get<T>(key: string): Promise<T | null>
storage.set<T>(key: string, value: T): Promise<void>
storage.remove(key: string): Promise<void>
storage.clear(): Promise<void>
```

**Usage:**
```typescript
await storage.set('settings', { theme: 'dark' });
const settings = await storage.get<Settings>('settings');
```

---

### `extension/src/shared/utils/proFeature.ts`
Pro subscription status checker.

**Exports:**
```typescript
checkProStatus(): Promise<boolean>
clearProCache(): void
showUpgradePrompt(): void
```

**Behavior:**
- `checkProStatus()` calls `/subscriptions/check` with 5-minute cache
- `clearProCache()` invalidates the cache
- `showUpgradePrompt()` shows browser alert for upgrade

---

### `extension/src/newtab/store/useSettingsStore.ts`
Zustand settings store with Chrome storage persistence.

**State:**
```typescript
interface SettingsState {
  settings: Settings;
  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<Settings>) => Promise<void>;
}
```

**Settings Type:**
```typescript
interface Settings {
  clockFormat: '12h' | '24h';
  showSeconds: boolean;
  showWeather: boolean;
  showQuote: boolean;
  showFocus: boolean;
  showTodo: boolean;
  showQuickLinks: boolean;
  showSearch: boolean;
  showBookmarks: boolean;
  // ... additional widget toggles
}
```

**Usage:**
```typescript
const { settings, loadSettings, updateSettings } = useSettingsStore();

useEffect(() => {
  loadSettings();
}, []);

await updateSettings({ showWeather: false });
```

---

### `extension/src/shared/types/index.ts`
Shared TypeScript type definitions.

**Types:**
```typescript
interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

interface QuickLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

interface Focus {
  text: string;
  completedAt?: string;
}

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  city: string;
}

interface Quote {
  text: string;
  author: string;
}

interface Settings {
  // Widget visibility toggles
  // Clock format preferences
  // etc.
}
```
