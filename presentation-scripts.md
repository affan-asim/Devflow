# Presentation Scripts: DevFlow Architecture

## A. Opening Script (~45-60 seconds)

"Good afternoon everyone. Today I'll be presenting DevFlow — a full-stack platform that connects developers with companies for job opportunities, applications, and hiring workflows.

At a high level, DevFlow separates concerns across several layers: the client UI built with Next.js App Router, request handling through a Next.js proxy layer, business logic in a service layer, data persistence with Prisma and PostgreSQL, and background processing via BullMQ workers.

What makes this architecture worth noting is the deliberate separation between user-facing features and operational concerns — the admin dashboard, queue monitoring, and direct file upload paths all have distinct responsibilities and failure modes.

I'll walk you through the request flow from client to data layer, then into background processing, and finally the administrative operations that keep the platform observable."

---

## B. System Architecture Script (~3-4 minutes)

### 1. Client and Frontend (0:00-0:30)

"Starting at the client: DevFlow uses Next.js App Router for the interface. The UI covers public marketplace views as well as dedicated experiences for developers, recruiters, and administrators. Client-side state is managed with Redux Toolkit, and HTTP requests go through Axios. This is a standard full-stack Next.js setup — the key point is that all three experiences share the same codebase but have different route trees and permissions."

### 2. Request Entry and Security (0:30-1:00)

"When a request enters the server, it first passes through the Next.js proxy — that's `src/proxy.js`. The proxy handles three critical functions: JWT verification using the `jose` library, refresh-token rotation, and Redis-backed rate limiting. 

Important distinction: the proxy *does not* replace authorization checks. API route handlers apply role-based checks, and input is validated where required. The service layer then handles business operations including ownership and business-rule checks.

The proxy forwards identity information as `x-user-id` and `x-user-role` headers to the API routes. For public API endpoints, these identity headers are stripped and only set from verified JWTs — never trusted from the caller.

One thing to watch: the JWT secret falls back to a hardcoded constant if the `SECRET_KEY` environment variable is missing. I'll flag this as a verification point later."

### 3. Backend Application Logic (1:00-1:30)

"Behind the proxy, requests flow through three sequential layers: authorization checks, Zod input validation, and then the service layer. 

The authorization layer applies per-route role checks and ownership validation. Zod schemas validate all incoming data — I've verified the job schema, company schemas, and application schemas all use Zod for type-safe validation.

The service layer is where business rules live. This includes applicable ownership checks, company verification workflows, and job operations. Each service method does one thing: handle the business operation, persist data via Prisma, and return results."

### 4. Data and Infrastructure (1:30-2:00)

"For data persistence, Prisma ORM sits between the application and PostgreSQL. PostgreSQL stores the main relational data — users, companies, jobs, applications, and associated records. Prisma provides the type-safe data-access layer.

Redis has several responsibilities. It's used for caching, OTP-related operations, and rate limiting. Critically, Redis also supports BullMQ, which processes tasks asynchronously. The trade-off: Redis supports caching, OTP, rate limiting, and queue infrastructure all in one place. This keeps infrastructure simple, but means those capabilities share a dependency and must be considered together when planning failure handling."

### 5. Background Processing (2:00-2:30)

"Background workers run separately from the request-handling path. Three primary workers handle different task types:

- The email worker sends messages through Resend and writes email logs to the database
- The notification worker handles notification records
- The storage worker processes storage-related tasks using Supabase Storage
- A fourth worker runs a scheduled daily task to update expired jobs

Each worker has its own concurrency settings and retry configurability. This separation allows the application to handle work outside the immediate HTTP request, but it introduces additional responsibilities: monitoring queues, handling failed jobs, and understanding what happens when Redis or a worker becomes unavailable."

### 6. External Services (2:30-2:45)

"The diagram includes two external services: Resend for email delivery, and Supabase Storage for object storage. The direct-upload path is particularly noteworthy — browsers can transfer file data directly to Supabase Storage using signed URLs, bypassing the application server entirely. This reduces bandwidth costs and improves upload performance."

### 7. Admin Monitoring (2:45-3:00)

"Beyond user-facing features, the admin area provides analytics, dashboard metrics, system-health information, email-log visibility, and queue operations. Admins can inspect failed jobs, retry them, and monitor system health across PostgreSQL, Redis, queues, and storage."

---

## C. Presenter Cues

| Diagram Section | Cue Point | What to Point At |
|----------------|-----------|------------------|
| Client/Frontend | After opening | Next.js App Router UI, Redux Toolkit + Axios |
| Request Entry | "JWT verification, refresh rotation" | `src/proxy.js` — proxy layer |
| Backend Logic | "Authorization, Zod validation" | Service layer flow: AUTHZ → VALIDATION → SERVICES |
| Data Infrastructure | "Prisma + PostgreSQL" | ER diagram section — relational data model |
| Redis | "Caching, OTP, Rate limiting, BullMQ" | Single Redis instance, multiple capabilities |
| Workers | "Email, Notification, Storage, Job Expiration" | Worker processes, BullMQ queues |
| External Services | "Direct upload to Supabase" | Signed URL flow, browser → storage |
| Admin Operations | "Dashboard metrics, queue ops" | Admin health page, queue inspection |

---

## D. Statements to Correct or Verify

### High-Priority Issues

1. **Hardcoded email recipient** — Seven email functions in `src/services/auth/emailNotifications.js` all send to `affanasim900@gmail.com` instead of the intended recipient email address from the job data. **This must be fixed before the presentation** — the emails are not sent to the actual users.

2. **Hardcoded JWT secret fallback** — `src/proxy.js` line 23 uses `process.env.SECRET_KEY || '1bb3c3fbc8c6a9332a08bca99dda8ddb9ad58cab8f045420b3abef9555bb1fbd'`. If the environment variable is absent, a constant secret is used. **Verify this is intentional or add a runtime warning.**

3. **Rate limiter bypasses Redis failure** — In `src/proxy.js`, when Redis operations fail (lines 93-118), the rate limiter is completely bypassed with a console error. No fallback limiting is applied. **This could allow request flooding during Redis outages.** Verify the intended failure behavior.

### Medium-Priority Items

4. **Email processor uses job ID as primary key** — `src/lib/processors/email.processor.js` line 99 uses `job.data.emailLogId || String(job.id)` as the upsert key. If job IDs could theoretically collide with existing email log IDs, this could cause conflicts. **Check if this is the intended design.**

5. **Redis shares multiple capabilities** — As noted in the architecture, caching, OTP, rate limiting, and BullMQ queue infrastructure all share the same Redis dependency. **Be prepared to discuss failure scenarios when Redis is partially available.**

### Low-Priority / Design Notes

6. **Job expiration scheduler uses Asia/Karachi timezone** — The daily job-expiration scheduler (workers/jobExpiration.worker.js) runs at midnight Asia/Karachi. **Verify this matches your target audience's expectations.**

7. **All email functions hardcode the same recipient** — This is the same issue as #1, categorized differently for presentation flow.

---