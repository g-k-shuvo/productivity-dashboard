# External Integrations

## OAuth Providers

### Google OAuth
**Purpose:** User authentication
**Configuration:** `backend/src/config/passport.ts`

| Environment Variable | Description |
|---------------------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

**Flow:**
1. User clicks "Sign in with Google" in extension
2. Extension opens `/api/v1/auth/google`
3. Passport redirects to Google consent screen
4. Google redirects back to `/api/v1/auth/google/callback`
5. `authController.googleCallback` handles token generation
6. User is redirected with tokens

**User Data Retrieved:**
- Email
- Display name
- Profile picture URL
- Google user ID (stored as `providerId`)

---

### GitHub OAuth
**Purpose:** User authentication
**Configuration:** `backend/src/config/passport.ts`

| Environment Variable | Description |
|---------------------|-------------|
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |

**Flow:**
1. User clicks "Sign in with GitHub" in extension
2. Extension opens `/api/v1/auth/github`
3. Passport redirects to GitHub consent screen
4. GitHub redirects back to `/api/v1/auth/github/callback`
5. `authController.githubCallback` handles token generation
6. User is redirected with tokens

**User Data Retrieved:**
- Email (primary or fallback to `username@github.com`)
- Display name (or username)
- Avatar URL
- GitHub user ID (stored as `providerId`)

---

## Payment Integration

### Stripe
**Purpose:** Subscription billing
**Service:** `backend/src/services/stripeService.ts`

| Environment Variable | Description |
|---------------------|-------------|
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `STRIPE_PRICE_ID` | Price ID for Pro subscription |

**Endpoints:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/stripe/checkout` | POST | Create checkout session |
| `/api/v1/stripe/webhook` | POST | Handle Stripe events |
| `/api/v1/stripe/success` | GET | Post-checkout success page |
| `/api/v1/stripe/cancel` | GET | Post-checkout cancel page |

**Webhook Events Handled:**
| Event | Action |
|-------|--------|
| `checkout.session.completed` | Create subscription record |
| `customer.subscription.updated` | Update subscription status |
| `customer.subscription.deleted` | Mark subscription canceled |
| `invoice.payment_succeeded` | Update billing period |
| `invoice.payment_failed` | Mark subscription past_due |

**Service Methods:**
- `createCheckoutSession(userId, email)` - Creates Stripe checkout
- `createCustomer(email, userId)` - Creates Stripe customer
- `getSubscription(subscriptionId)` - Retrieves subscription details
- `cancelSubscription(subscriptionId)` - Cancels subscription
- `handleWebhook(payload, signature)` - Processes webhook events

---

## Image API

### Unsplash
**Purpose:** Background images for new tab
**Service:** `backend/src/services/unsplashService.ts`

| Environment Variable | Description |
|---------------------|-------------|
| `UNSPLASH_ACCESS_KEY` | Unsplash API access key |

**Endpoints:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/images/daily` | GET | Get daily background image |
| `/api/v1/images/search` | GET | Search images by query |

**Service Methods:**
- `getDailyImage()` - Fetches random nature/landscape image
- `searchImages(query, page, perPage)` - Searches images

**Response Format:**
```typescript
interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    username: string;
  };
  links: {
    html: string;
  };
}
```

**Attribution:** Unsplash requires photo attribution. Response includes photographer name and link.

---

## Weather API

### OpenWeatherMap
**Purpose:** Current weather and forecasts
**Service:** `backend/src/services/weatherService.ts`

| Environment Variable | Description |
|---------------------|-------------|
| `OPENWEATHERMAP_API_KEY` | OpenWeatherMap API key |

**Endpoints:**
| Endpoint | Method | Parameters | Purpose |
|----------|--------|------------|---------|
| `/api/v1/weather/current` | GET | `lat`, `lon` | Current weather by coordinates |
| `/api/v1/weather/forecast` | GET | `lat`, `lon` | 5-day forecast |

**Service Methods:**
- `getCurrentWeather(lat, lon)` - Current conditions
- `getWeatherByCity(city)` - Current conditions by city name
- `getForecast(lat, lon)` - 5-day/3-hour forecast

**Response Format:**
```typescript
interface WeatherData {
  temperature: number;     // Celsius
  feelsLike: number;
  humidity: number;        // Percentage
  windSpeed: number;       // m/s
  condition: string;       // "Clear", "Clouds", etc.
  description: string;     // Detailed description
  icon: string;            // Weather emoji
  city: string;
  country: string;
}
```

**Weather Icons Mapping:**
| Condition | Icon |
|-----------|------|
| Clear | ☀️ |
| Clouds | ☁️ |
| Rain | 🌧️ |
| Drizzle | 🌦️ |
| Thunderstorm | ⛈️ |
| Snow | ❄️ |
| Mist/Fog | 🌫️ |

---

## AI Services

### OpenAI
**Purpose:** AI chat and note summarization
**Service:** `backend/src/services/aiService.ts`

| Environment Variable | Description |
|---------------------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |

**Model Used:** `gpt-3.5-turbo`

**Service Methods:**
- `chatWithOpenAI(messages, systemPrompt)` - Chat completion
- `generateNoteSummary(content)` - Summarize notes
- `suggestNoteOrganization(notes)` - Suggest note organization

**Response Format:**
```typescript
interface AIResponse {
  message: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
```

---

### Anthropic (Claude)
**Purpose:** AI chat alternative
**Service:** `backend/src/services/aiService.ts`

| Environment Variable | Description |
|---------------------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key |

**Model Used:** `claude-3-haiku-20240307`

**Service Methods:**
- `chatWithAnthropic(messages, systemPrompt)` - Chat completion

**Note:** Both OpenAI and Anthropic are available. The controller can route to either based on user preference or configuration.

---

## Task Manager Integrations (Planned)

The `Integration` model supports connecting to external task managers:

| Service | Status | Purpose |
|---------|--------|---------|
| Todoist | Planned | Two-way task sync |
| Asana | Planned | Two-way task sync |
| ClickUp | Planned | Two-way task sync |
| Trello | Planned | Two-way task sync |
| Notion | Planned | Two-way task sync |

**Integration Model Fields:**
- `service` - Service identifier
- `accessToken` - OAuth access token
- `refreshToken` - OAuth refresh token (if applicable)
- `tokenExpiresAt` - Token expiration
- `metadata` - Service-specific settings

**Endpoints:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/integrations` | POST | Add integration |
| `/api/v1/integrations` | GET | List integrations |
| `/api/v1/integrations/:id` | GET | Get integration |
| `/api/v1/integrations/:id` | PUT | Update integration |
| `/api/v1/integrations/:id` | DELETE | Remove integration |
| `/api/v1/integrations/:id/sync` | POST | Sync tasks |

---

## Storage Integration (Optional)

### AWS S3
**Purpose:** File storage (alternative to local)
**Configuration:** `backend/src/config/env.ts`

| Environment Variable | Description |
|---------------------|-------------|
| `STORAGE_TYPE` | 'local' or 's3' |
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |
| `AWS_REGION` | AWS region |
| `AWS_S3_BUCKET` | S3 bucket name |

**Note:** Currently defaults to local storage (`/uploads/{userId}/`). S3 support is configured but not actively implemented.

---

## Redis (Configured, Not Active)

| Environment Variable | Description |
|---------------------|-------------|
| `REDIS_HOST` | Redis host |
| `REDIS_PORT` | Redis port |

**Planned Uses:**
- Session storage
- Rate limiting persistence
- API response caching
- Real-time notifications
