# DevFlow Presentation Scripts and Verification

## A. Opening Script (≈45-60 seconds)

Good morning/afternoon everyone. I'm [Name], and today I'll walk through the architecture of DevFlow — a platform that connects developers with opportunities and companies with technical talent.

At a high level, DevFlow is organized into several layers, each with a clear responsibility. Starting from the client side, the application uses Next.js App Router for the interface, with Redux Toolkit for client state and Axios for HTTP requests. The interface covers public marketplace views as well as developer, recruiter, and admin experiences.

When a request reaches the server, it passes through the Next.js proxy layer. This is responsible for JWT verification, refresh-token rotation, Redis-backed rate limiting, and forwarding identity information — specifically `x-user-id` and `x-user-role` headers — derived from the verified token. A key point: the proxy does not replace authorization checks in the backend. The API route handlers apply the relevant role checks, and input is validated where required. The service layer then handles the actual business operations, including ownership and business-rule checks.

For data persistence, Prisma ORM interacts with PostgreSQL, which stores relational data — users, companies, jobs, applications, and associated records. Redis serves multiple purposes: caching, OTP operations, and rate limiting, and it also supports BullMQ for asynchronous task processing.

Background workers run separately from the request-handling path. The email worker sends messages through Resend and records email logs. The notification worker handles notification records. The storage worker processes storage-related tasks using Supabase Storage, and a job-expiration worker runs a scheduled task to update expired jobs.

This separation allows the application to handle work outside the immediate HTTP request, though it introduces additional responsibilities like monitoring queues, handling failed jobs, and understanding what happens when Redis or a worker becomes unavailable.

The admin area provides analytics, dashboard metrics, system-health information, email-log visibility, and queue operations such as inspecting or retrying failed jobs. There's also a direct upload path to Supabase Storage using a signed URL, where the browser transfers file data directly to the storage service rather than sending it through the application server.

A key trade-off: Redis supports several different capabilities — caching, OTP, rate limiting, and queue infrastructure — keeping the infrastructure simpler, but meaning those capabilities share a dependency and must be considered together when planning failure handling and reliability.

Overall, the main idea is to separate the user interface, request handling, business logic, data persistence, and background processing while keeping their interactions explicit.

## B. System Architecture Script (≈3-4 minutes)

Let me walk through the actual request flow using the real implementation.

**Request Entry and Security**

When a client request enters the server, it first reaches `src/proxy.js` — the Next.js middleware. This is the single point where several cross-cutting concerns are handled before the request reaches API route handlers.

The proxy begins by extracting the `access-token` and `refresh-token` from the request cookies. If an access token is present, it's verified via `jwtVerify` using a secret encoded from `process.env.SECRET_KEY`, with a hardcoded fallback value. If verification succeeds, the decoded payload — containing `userId` and `role` — is attached to the request context.

If the access token is invalid or expired, the proxy attempts a refresh flow. It calls `/api/auth/refresh` with the `refresh-token` cookie. The refresh service validates the token against the `prisma.refreshToken` model, checking that it hasn't been revoked and hasn't expired. If valid, new access and refresh tokens are generated, the old refresh token is revoked in the database, and new cookies are set on the response. If refresh fails, the request proceeds with a 401 response for API routes or a redirect to `/login` for non-API routes.

After authentication, rate limiting is applied. For public API routes — listed in `PUBLIC_APIS` — a shared `tokenBucket` using the client IP is checked. For authenticated routes, per-user rate limiting uses `decoded.userId` or `decoded.email`. The `tokenBucket` is implemented as a Lua script in `src/services/rateLimiter/rateLimiterScript.lua` with bucket capacity of 10 and refill rate of 1 token per second. If the bucket is exhausted, a 429 response is returned. Critically, when Redis is unavailable, the rate limiter is bypassed entirely — the code logs "Bypassing rate limiter" and continues, which means requests that should be throttled may pass through.

Identity headers are then injected. For protected non-public API routes, `x-user-id` and `x-user-role` are set on the request headers using the decoded JWT payload. An important design note in the code states: "Never trust identity headers supplied by the caller. Public endpoints may use identity only when it came from a verified JWT." However, the code still sets these headers on public route responses, which is worth noting.

**Route Handler and Validation**

The request then reaches the appropriate API route handler. Each handler independently reads `x-user-id` and `x-user-role` from the headers and applies role-based checks. For example, the admin user detail endpoint at `src/app/api/admin/users/[id]/route.js` checks `if (!userIdHeader || userRole !== ROLE.ADMIN)` and returns 403 Forbidden if the check fails. Similarly, job update and delete endpoints at `src/app/api/jobs/[id]/route.js` check `if (userRole !== ROLE.RECRUITER)` and return 403.

Input validation uses Zod schemas. The job update handler parses the request body with `updateJobSchemaSchema.parse(body)`, which is a partial refinement of the main job schema requiring at least one field. If validation fails, a 400 response with detailed field errors is returned.

**Service Layer and Business Logic**

Once validation passes, the route handler delegates to the service layer. For job operations, this is `src/services/jobs/jobService.js`. The `getJob(id, role, userId)` function is the central gateway for job data retrieval.

In `getJob`, the role determines what data is returned and how it's accessed. If the requester is an admin, application statistics — counts of applications by status — are computed and included in the response. If the requester is a recruiter, the function validates that the job belongs to the recruiter's company by fetching the recruiter profile and checking `profile.companyId` against the job's `companyId`. Recruiters can only view jobs in their own company.

For developers, the function caches job data in Redis using a key like `jobDetail:v2:{id}`, with per-developer state (saved jobs, applications) fetched separately. If the requester is neither admin nor recruiter, the function still returns job data but without developer-specific saved/application state unless the user is a developer.

The `updateJob` service function also performs company ownership validation. It fetches the recruiter profile, verifies `existingJob.companyId === profile.companyId`, and throws a 400 error if the user tries to modify another company's job. Similarly, `deleteJob` checks company ownership and rejects the operation if the job has existing applications.

**Data Infrastructure**

Service layer functions interact with PostgreSQL through Prisma. Queries use `prisma.job.findUnique`, `prisma.job.findMany`, `prisma.job.update`, and `prisma.job.delete` with appropriate `where` clauses and `include` options for related data like company, recruiter, and skills.

Redis caching is used extensively. Job details are cached under keys like `jobDetail:v2:{id}` with a 300-second TTL. Admin job lists are cached with a 60-second TTL. Recruiter profiles are cached under keys like `recruiterProfileKey:{userId}`. Company details have separate cached versions for general and admin views, with the admin version including owner and recruiter details.

**Background Processing**

Outside the request path, BullMQ workers process asynchronous tasks. The email worker (`src/workers/Email.worker.js`) processes jobs from the "emails" queue with concurrency of 5 and a per-second limiter of 2. When a job is processed, `src/lib/processors/email.processor.js` dispatches to the appropriate email type — verification, invitation, company verification, employment event, application accepted/rejected, company join request status, or recruiter invite status. Each email type calls the corresponding function from `src/services/auth/emailNotifications.js`, which sends via Resend using the `resend` SDK.

A critical detail: every single email type sends to the hardcoded recipient `['affanasim900@gmail.com']`. This is the developer's personal email address, configured during development. In production, this would need to be replaced with the actual recipient from the job data or user profile.

Email outcomes are tracked via `prisma.emailLog.upsert`, which creates or updates a log record with status `PENDING`, `COMPLETED`, or `FAILED`, and stores any error message if processing fails.

The notification worker (`src/workers/notification.worker.js`) processes "notifications" queue jobs. The storage worker (`src/workers/storage.worker.js`) processes "storage" queue jobs with concurrency of 10 and a per-10-second limiter of 9, handling file operations via `src/lib/processors/processStorage.processor.js` and writing to Supabase Storage.

A job-expiration worker runs a scheduled task (referenced in `expirePastDeadlineJobs` in jobService) that updates job status to "EXPIRED" when the deadline passes.

**Direct Upload Path**

The diagram mentions a direct upload path to Supabase Storage using signed URLs. Looking at the code, `src/services/presignedUrl/presignedUrl.js` generates signed URLs that the browser can use to upload files directly to Supabase Storage, bypassing the application server for the actual file transfer. This is referenced in `src/services/profile/recuiterService.js` where a `tempKey` is checked during profile updates, and the storage queue is triggered to process the uploaded file.

**Admin Operations**

The admin area provides several read-only operations. `src/app/api/admin/dashboard/page.jsx` renders dashboard metrics. Admin API routes include:

- `GET /api/admin/users/[id]` — retrieves user details, restricted to admins via `x-user-role` check
- `GET /api/admin/jobs/[id]` — retrieves full job details with application statistics
- `DELETE /api/admin/jobs/[id]` — deletes a job (if no applicants)
- `PATCH /api/admin/company/[id]` — updates company verification status
- Various analytics endpoints pulling user, job, application, and company counts

All admin endpoints verify `userRole === ROLE.ADMIN` from the `x-user-role` header before proceeding.

**Infrastructure Dependencies and Failure Handling**

A significant trade-off: Redis supports caching, OTP operations, rate limiting, and BullMQ queue infrastructure. This keeps the infrastructure simpler, but it means these capabilities share a dependency. If Redis becomes unavailable, multiple systems are affected: rate limiting is bypassed (as discussed), cached data is lost, OTP generation/verification fails, and BullMQ workers cannot dequeue jobs. The system doesn't appear to have Redis redundancy or fallback mechanisms described in the code.

Similarly, if Resend API calls fail, email jobs are marked as FAILED in the email log, but there's no visible DLQ or alerting mechanism beyond the worker's console output.

If workers crash, they have restart logic via SIGTERM/SIGINT handlers, but there's no described mechanism for automatic restart or monitoring beyond the console logs.

## C. Presenter Cues

| Diagram Section | Cue |
|---|---|
| **Client → Proxy** | Point to `PROXY` box in diagram. Note that this is Next.js middleware (`src/proxy.js`) handling JWT verification, refresh rotation, and rate limiting. |
| **Proxy → API (x-user-id / x-user-role)** | Indicate the arrow from PROXY to API. Emphasize that identity headers are injected here, and each downstream route handler independently validates the role. |
| **API → AuthZ → Validation → Services** | Trace the flow through the BACKEND box. Note that Zod validation happens before service invocation, and each service function independently checks ownership. |
| **Prisma → PostgreSQL** | Point to the DATA box. Note that all data operations go through Prisma ORM. |
| **Services → Redis → BullMQ → Workers** | Show the connection from BACKEND to DATA and WORKERS. Explain that email, notification, and storage jobs are enqueued to Redis and processed by separate worker processes. |
| **Direct upload (client → Supabase)** | Indirect the dotted line from CLIENT_STATE to OBJECT_STORAGE. Mention that presigned URLs let the browser upload directly, bypassing the app server. |
| **Admin area** | Point to the ADMIN box. Note that all admin operations verify the `x-user-role` header is `ADMIN` before proceeding. |
| **Redis dependency** | When discussing trade-offs, note that Redis caches, rate limiting, OTP, and queue infrastructure are all in one Redis instance — a single point of failure that must be considered for reliability. |
| **Hardcoded email recipient** | Mention that all email jobs send to `affanasim900@gmail.com` — this is a development configuration that must be changed for production. |

## D. Statements to Correct or Verify Before the Meeting

1. **Hardcoded email recipient**: Every email-sending function in `src/services/auth/emailNotifications.js` sends to `['affanasim900@gmail.com']` — the developer's personal email address. This is a development/testing configuration. In production, the `to` address should come from the job data or user profile, not be hardcoded.

2. **Weak JWT-secret fallback**: In `src/proxy.js:23`, the JWT secret falls back to a hardcoded value `'1bb3c3fbc8c6a9332a08bca99dda8ddb9ad58cab8f045420b3abef9555bb1fbd'` if `process.env.SECRET_KEY` is not set. This should be treated as a development default only; the environment variable must be configured in production.

3. **Rate limiter bypass on Redis failure**: When Redis is unavailable in `proxy.js`, the rate limiter is silently bypassed (lines 93-118). Requests that should be throttled may pass through. This behavior should be documented as a known limitation, and a fallback strategy (e.g., rejecting requests or using a in-memory limiter) should be considered.

4. **Identity headers set on public routes**: The proxy sets `x-user-id` and `x-user-role` headers even on public routes (lines 126-140). The code comments state "Never trust identity headers supplied by the caller," but the implementation still sets these headers broadly. Clarify whether this is intentional or if public routes should not receive these headers.

5. **Refresh token DB dependency**: The refresh flow (`src/services/auth/refreshService.js`) requires a valid entry in `prisma.refreshToken` for the user. If the refresh table is cleared or migrated, all refresh tokens become invalid, forcing users to re-login. This is a design trade-off — refresh tokens are tied to the database, unlike pure JWT-based systems where refresh could be stateless.

6. **No DLQ or alerting for failed workers**: When email/notification/storage jobs exhaust all retry attempts, the worker logs an "ALERT" message to console, but there's no dead-letter queue, Sentry integration, Slack webhook, or monitoring alert described in the code. Failed jobs are simply marked as `FAILED` in the email log.

7. **Email job `emailLogId` dependency**: In `src/lib/processors/email.processor.js:99-103`, the email log is created with `id: job.data.emailLogId || String(job.id)`. The `emailLogId` must be properly set when the job is enqueued; otherwise, email logs may use the job ID as the primary key, which could lead to inconsistencies.

8. **Direct upload presigned URL implementation**: The diagram mentions a direct upload path to Supabase Storage. Verify that `src/services/presignedUrl/presignedUrl.js` properly generates signed URLs with appropriate TTL and permissions, and that the storage worker correctly processes uploaded files and updates the database records.

9. **Admin job deletion prerequisite**: The admin job deletion endpoint (`src/app/api/admin/jobs/[id]/route.js`) and the `deleteJobByAdmin` service function check that the job has no applicants before allowing deletion. If applicants exist, a 400 error is returned. This business rule should be explicitly noted.

10. **Redis key namespace separation**: The code uses separate Redis key namespaces for different purposes (e.g., `companyDetail:{id}` vs `companyDetail:admin:{id}`, `jobDetail:v2:{id}` vs `jobList:*`). This separation prevents general company detail queries from exposing admin-only data, but it's worth noting that the admin payload is intentionally kept separate.