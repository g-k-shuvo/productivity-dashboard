# Architecture Overview

## Stack

| Layer | Technology |
|-------|------------|
| Backend Runtime | Node.js 18+ |
| Backend Framework | Express.js |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL |
| ORM | TypeORM |
| Validation | Zod |
| Authentication | Passport.js (Google OAuth, GitHub OAuth) |
| Payments | Stripe |
| Logging | Winston |
| Extension Framework | Chrome Extension Manifest V3 |
| Extension UI | React 18 |
| Extension Build | Vite |
| Extension State | Zustand |
| HTTP Client | Axios |
| Testing | Jest, @testing-library/react, supertest |
| Linting | ESLint |
| Formatting | Prettier |
| Containerization | Docker, Docker Compose |

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Chrome Extension                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   New Tab    │  │   Settings   │  │   Background Worker  │   │
│  │   (React)    │  │   (React)    │  │   (Service Worker)   │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
│         │                 │                      │               │
│         └─────────────────┼──────────────────────┘               │
│                           │                                      │
│                   ┌───────┴───────┐                              │
│                   │ Zustand Store │                              │
│                   │ Chrome Storage│                              │
│                   └───────┬───────┘                              │
└───────────────────────────┼──────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Express Backend                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                     Middleware Stack                        │ │
│  │  helmet → cors → json → session → passport → rateLimiter   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            │                                     │
│  ┌─────────────────────────┼─────────────────────────────────┐  │
│  │                      Routes                                │  │
│  │  auth │ users │ tasks │ habits │ metrics │ ai │ stripe...  │  │
│  └─────────────────────────┼─────────────────────────────────┘  │
│                            │                                     │
│  ┌─────────────────────────┼─────────────────────────────────┐  │
│  │                    Controllers                             │  │
│  └─────────────────────────┼─────────────────────────────────┘  │
│                            │                                     │
│  ┌─────────────────────────┼─────────────────────────────────┐  │
│  │                     Services                               │  │
│  │  auth │ subscription │ stripe │ ai │ sync │ weather...     │  │
│  └─────────────────────────┼─────────────────────────────────┘  │
│                            │                                     │
│  ┌─────────────────────────┼─────────────────────────────────┐  │
│  │                 TypeORM Models (15)                        │  │
│  └─────────────────────────┼─────────────────────────────────┘  │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       PostgreSQL                                 │
│  users │ subscriptions │ tasks │ habits │ metrics │ ...         │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Authentication Flow

```
User → Extension → /api/v1/auth/google → Google OAuth → Callback
                                                            │
                 ┌──────────────────────────────────────────┘
                 ▼
         authService.findOrCreateUser()
                 │
                 ▼
         authService.generateTokenPair()
                 │
                 ├─→ Access Token (JWT, 15min expiry)
                 └─→ Refresh Token (stored in DB, 7day expiry)
```

### API Request Flow

```
Extension API Service
        │
        │ Authorization: Bearer <token>
        ▼
   Rate Limiter (100 req/15min)
        │
        ▼
   Auth Middleware (verifyAccessToken)
        │
        ▼
   [Pro Feature Check] ─── if Pro route
        │
        ▼
   Controller
        │
        ▼
   Service Layer
        │
        ▼
   TypeORM Repository
        │
        ▼
   PostgreSQL
```

### Subscription/Payment Flow

```
Extension → /api/v1/stripe/checkout
                    │
                    ▼
          stripeService.createCheckoutSession()
                    │
                    ▼
          Stripe Checkout (hosted page)
                    │
                    ▼
          Stripe Webhook → /api/v1/stripe/webhook
                    │
                    ▼
          stripeService.handleWebhook()
                    │
                    ├─→ checkout.session.completed
                    ├─→ customer.subscription.updated
                    ├─→ customer.subscription.deleted
                    └─→ invoice.payment_succeeded/failed
                    │
                    ▼
          subscriptionService.createSubscription() / updateSubscription()
```

## Infrastructure

### Docker Services (docker/docker-compose.yml)

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| postgres | postgres:15 | 5432 | Primary database |
| redis | redis:7 | 6379 | Session/cache (configured but not actively used) |
| backend | Dockerfile.backend | 3000 | API server |

### Environment Configuration

The backend loads configuration via `config/env.ts`:

- **Database**: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- **JWT**: `JWT_SECRET`, `JWT_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN`
- **OAuth**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- **External APIs**: `UNSPLASH_ACCESS_KEY`, `OPENWEATHERMAP_API_KEY`
- **AI**: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`
- **Payments**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`
- **Storage**: `STORAGE_TYPE` (local/s3), `AWS_*` for S3
- **Redis**: `REDIS_HOST`, `REDIS_PORT`

### Logging

Winston logger writes to:
- `backend/logs/combined.log` - All logs
- `backend/logs/error.log` - Error logs only
- Console (development only)

## Security

1. **Helmet.js** - HTTP security headers
2. **CORS** - Restricted origins in production
3. **Rate Limiting** - 100 requests/15min for API, 5 requests/15min for auth
4. **JWT** - Short-lived access tokens with refresh token rotation
5. **Session** - HTTP-only, secure cookies in production
6. **TypeORM** - Parameterized queries (SQL injection protection)
7. **Passport.js** - OAuth provider handling

## Scalability Considerations

- **Stateless API** - JWT-based auth allows horizontal scaling
- **Database Connection Pooling** - Managed by TypeORM
- **Redis** - Configured for session store/caching (not yet implemented)
- **S3 Storage** - Configured option for file uploads
