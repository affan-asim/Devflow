# DevFlow System Architecture Diagram

## Mermaid Flowchart Source

```mermaid
flowchart LR
    %% =====================
    %% Client and Frontend
    %% =====================
    subgraph Client["Client and Frontend"]
        direction TB
        UI["Browser UI\n- Next.js App Router\n- React 19 components\n- Tailwind CSS v4\n- lucide-react icons"]:::client
        APIClient["API Client\n- axios with cookies\n- JWT tokens in httpOnly cookies"]:::client
    end

    %% =====================
    %% Request Interception and Route Handling
    %% =====================
    subgraph Proxy["Request Interception and Route Handling"]
        direction TB
        proxy["proxy.js\n- Server-side proxy\n- JWT verification\n- Rate limiting\n- Token bucket (Lua)\n- Route rewrites/redirects"]:::proxy
        middleware["Middleware concepts\n- Auth checks\n- Public route protection"]:::proxy
    end

    Client -->|HTTP Requests| Proxy
    Proxy -->|Rewrites/Redirects| Client
    Proxy -->|API Routes| Server[["Server-side Code\n- src/app/api/*\n- Route handlers"]:::server]

    %% =====================
    %% Authentication, Validation, Authorization, Business Logic
    %% =====================
    subgraph Auth["Authentication, Validation, Authorization & Business Logic"]
        direction TB
        jwt["JWT Generation/Verification\n- generateToken()\n- verifyToken()\n- jsonwebtoken\n- bcrypt for password hashing"]:::auth
        validator["Zod Validation\n- companySchema\n- verifyCompanySchema\n- login validation"]:::auth
        service["Service Layer\n- authService.js\n- companyService.js\n- jobService.js\n- recruiterService.js\n- employmentHistoryService.js"]:::auth
        prisma["Prisma Client\n- Database access\n- $transactions\n- Raw SQL queries"]:::auth
    end

    Proxy -->|Decoded JWT| Auth
    Auth -->|DB Queries| prisma
    Auth -->|Email Notifications| Queues

    %% =====================
    %% PostgreSQL through Prisma
    %% =====================
    subgraph DB["PostgreSQL through Prisma"]
        direction TB
        prismaClient["Prisma Client\n- Generated from schema.prisma\n- User, Company, Job, Application models"]:::db
        tables["PostgreSQL Tables\n- users, companies, jobs, applications,\n- recruiter_history, employment_history, verificationOTPs"]:::db
    end

    Auth -->|SQL Operations| prismaClient
    prismaClient -->|Read/Write| tables

    %% =====================
    %% Redis Cache and Rate Limiting
    %% =====================
    subgraph Redis["Redis Cache and Rate Limiting"]
        direction TB
        redisClient["Redis (ioredis)\n- Connection pooling\n- Token bucket rate limiter\n- Lua script implementation"]:::redis
        cache["Dashboard metrics cache\n- 5-minute TTL\n- JSON-serialized data"]:::redis
        rateKeys["Rate limiter keys\n- ratelimiter:{userId}:{window}"]:::redis
        otpKeys["OTP storage\n- otpKey:{email} with EX 300s"]:::redis
        sessionKeys["Session/Data keys\n- dashboardDatakey, recruiterProfileKey:*"]:::redis
    end

    Auth -->|Redis Ops| redisClient
    Proxy -->|Rate Checks| redisClient
    dashboard["Admin Dashboard\n- System health page"]:::redis -->|Cache Reads| redisClient

    %% =====================
    %% BullMQ Producers, Queues, and Workers
    %% =====================
    subgraph Queues["BullMQ Producers, Queues, and Workers"]
        direction TB
        emailProducer["Email Producer\n- emailQueue.add()\n- from authService, companyService"]:::queues
        notificationProducer["Notification Producer\n- notificationQueue.add()\n- from companyService.updateCompanyVerification"]:::queues
        storageProducer["Storage Producer\n- s3Queue.add()\n- from recruiterService.updateRecuiterProfile"]:::queues
        emailWorker["Email Worker\n- src/workers/Email.worker.js\n- concurrency: 5\n- limiter: 2 req/1s"]:::queues
        notificationWorker["Notification Worker\n- src/workers/notification.worker.js"]:::queues
        storageWorker["Storage Worker\n- src/workers/storage.worker.js"]:::queues
        jobExpirationWorker["Job Expiration Worker\n- src/workers/jobExpiration.worker.js"]:::queues
    end

    service -->|Queue Add| emailProducer
    service -->|Queue Add| notificationProducer
    service -->|Queue Add| storageProducer
    emailProducer -->|BullMQ| emailWorker
    notificationProducer -->|BullMQ| notificationWorker
    storageProducer -->|BullMQ| storageWorker

    %% =====================
    %% External Services
    %% =====================
    subgraph External["External Services"]
        direction TB
        awsS3["AWS S3\n- S3Client\n- presigned URLs\n- @aws-sdk/client-s3"]:::external
        supabase["Supabase Storage\n- supabase client\n- @supabase/supabase-js"]:::external
        resend["Resend\n- @resend/resend\n- Email sending"]:::external
    end

    storageWorker -->|Presigned URLs| awsS3
    emailWorker -->|Send Email| resend
    notificationWorker -->|Send Notification| resend

    %% =====================
    %% Monitoring and Administrative Visibility
    %% =====================
    subgraph Monitor["Monitoring and Administrative Visibility"]
        direction TB
        systemHealth["System Health Page\n- src/app/dashboard/admin/system-health/page.jsx"]:::monitor
        queueSummary["Queue Summary\n- getQueuesSummary()\n- getFailedJobsByQueue()\n- retryFailedJob()"]:::monitor
        adminMetrics["Admin Metrics\n- getDashboardMetrics()\n- Redis-cached (5min TTL)"]:::monitor
        emailLogs["Email Logs API\n- src/app/api/admin/email-logs/route.js"]:::monitor
    end

    dashboard -->|Health Checks| redisClient
    dashboard -->|Queue Metrics| queueSummary
    dashboard -->|App Metrics| adminMetrics

    %% =====================
    %% Styles
    %% =====================
    classDef client fill:#e3f2fd,stroke:#1976d2,stroke-width:2px;
    classDef server fill:#e8f5e9,stroke:#388e3c,stroke-width:2px;
    classDef auth fill:#fff3e0,stroke:#f57c00,stroke-width:2px;
    classDef db fill:#ffebee,stroke:#c62828,stroke-width:2px;
    classDef redis fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    classDef queues fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px;
    classDef external fill:#e0f7fa,stroke:#00bcd4,stroke-width:2px;
    classDef monitor fill:#fafafa,stroke:#5e5e5e,stroke-width:2px;
```

## Verified Component-to-File Mapping

| Component | File | Responsibility |
|-----------|------|----------------|
| **JWT Authentication** | `src/utils/auth.js` | Token generation/verification, password hashing |
| **Login Route** | `src/app/api/auth/login/route.js` | POST login, sets access/refresh cookies |
| **Auth Middleware/Proxy** | `src/proxy.js` | Request proxy, JWT validation, rate limiting |
| **Prisma Schema** | `prisma/schema.prisma` | DB models, enums (ROLE, STATUS, JobStatus, etc.) |
| **Redis Client** | `src/lib/redis.js` | ioredis connection with TLS/options |
| **Email Queue** | `src/lib/queues/email.queue.js` | BullMQ queue for email jobs |
| **Email Worker** | `src/workers/Email.worker.js` | Processes email jobs from BullMQ |
| **Notification Queue** | `src/lib/queues/notification.queue.js` | BullMQ queue for notifications |
| **Company Verification** | `src/services/company/companyService.js` | Updates company `isVerified` status |
| **System Health** | `src/app/dashboard/admin/system-health/page.jsx` | Monitors Redis, DB, queues, storage |
| **Queue Admin API** | `src/app/api/admin/system/queues/[queue]/route.js` | Failed job inspection & retry |
| **Rate Limiting** | `src/services/rateLimiter/rateLimiter.js` + Lua script | Token bucket algorithm |

## Request Lifecycle Explanation

1. **Incoming Request**: Browser sends HTTP request with JWT access-token cookie
2. **Proxy Middleware** (`proxy.js`):
   - Verifies JWT signature using `SECRET_KEY`
   - Checks rate limiting via Redis token bucket (Lua script)
   - If valid: passes request headers (`x-user-id`, `x-user-role`) to the route handler
   - If invalid: returns 401 Unauthorized or redirects to `/login`
3. **Route Handler** processes the request:
   - Validates input with Zod schemas
   - Calls service layer for business logic
   - Prisma queries for DB operations
   - May add jobs to BullMQ queues (email, notification, storage)
   - Returns JSON response
4. **Background Workers** process queued jobs:
   - Email Worker sends via Resend API
   - Notification Worker sends via Resend API  
   - Storage Worker handles S3 presigned URLs
5. **Dashboard** fetches metrics from Redis cache (5-min TTL) or Prisma queries
6. **Rate limiter** tracks per-user requests in Redis with token bucket (Lua script) same as proxy's one

## Three Important Architecture Decisions & Trade-offs

### 1. Proxy.js vs Middleware Deprecation
- **Decision**: Using `proxy.js` (Next.js app router style) instead of deprecated `middleware.js`
- **Trade-off**: Proxy executes before routes render and can modify responses, but cannot run per-request code that depends on shared modules/globals. The codebase acknowledges this limitation with comments about not relying on shared modules.

### 2. Redis as Primary Cache + Fallback to PostgreSQL
- **Decision**: Redis for rate limiting, dashboard metrics, and OTP verification with PostgreSQL fallback
- **Trade-off**: When Redis is down, the system falls back to Postgres (seen in `authService.js` lines 50-61). This ensures functionality continues but with potentially stale data and no rate limiting protection.

### 3. BullMQ Workers with Lua-token-bucket Rate Limiting
- **Decision**: Email workers limited to 2 concurrent jobs with 1s exponential backoff; API rate limiting via Redis Lua token bucket
- **Trade-off**: Concurrency limits improve system stability but increase email delivery latency. The token bucket (10 tokens, 1/sec refill) provides smooth throttling but may reject bursts even when total capacity exists.

## Two Potential Reliability/Security Gaps (Evidence in Code)

### 1. Redis-Dependent Features Without Guaranteed Availability
- **Evidence**: `authService.js` lines 47-62 — when Redis SET fails, it falls back to Prisma `verificationOtp` table. However, `proxy.js` rate limiting (lines 88, 98) will bypass entirely if Redis throws, potentially allowing request floods.

### 2. Cookie-Based Auth Without CSRF Protection Indication
- **Evidence**: Login route sets `httpOnly` cookies (login route.js lines 26-38), but the proxy.js checks `accessToken` from `req.cookies.get('access-token')`. The `sameSite: "lax"` setting provides partial CSRF protection, but the codebase doesn't show explicit CSRF token validation for state-changing operations. The `axios` instance (api.js) uses `withCredentials: true` which sends cookies cross-origin.
