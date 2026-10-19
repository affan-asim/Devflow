# DevFlow

> A full-stack developer hiring platform engineered with Next.js 16 App Router, PostgreSQL (Prisma ORM), Redis, and BullMQ asynchronous background workers.

DevFlow connects developers with job opportunities while providing recruiters and company owners a unified workspace to manage hiring pipelines, candidate applications, team invitations, and verified employment records. Dedicated administrative workflows provide platform governance, company verification, system health monitoring, and queue telemetry.

---

## Demo & Visuals

> **[MANUAL TASK REQUIRED]**: Before sharing with recruiters, supply your live application deployment URL and visual assets below.

- **Live Deployment**: `<!-- [MANUAL TASK]: Insert live demo URL (e.g., https://devflow.example.com) -->`
- **Application Preview**:
  <!-- [MANUAL TASK]: Insert screenshots or GIF walkthroughs of Developer Dashboard, Recruiter Workspace, and Admin Telemetry -->
  *Screenshots pending upload.*

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Roles & Permissions](#roles--permissions)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Data Model & Integrity](#data-model--integrity)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Background Workers](#background-workers)
- [Security Model](#security-model)
- [Architectural Decisions & Production Roadmap](#architectural-decisions--production-roadmap)
- [Testing & Code Quality](#testing--code-quality)
- [Project Directory Structure](#project-directory-structure)

---

## Overview

DevFlow is designed around domain-driven service architecture, separating UI presentation, HTTP route handling, domain business logic, relational persistence, and asynchronous worker execution.

Server-side business logic is decoupled into dedicated service modules (`src/services/*`). Relational persistence is handled by PostgreSQL via Prisma ORM, while Redis and BullMQ power queueing, caching, and token-bucket rate limiting. Asynchronous operations—such as transactional email dispatch, notifications, temporary-to-permanent file promotion, and scheduled job expiration—are isolated into standalone worker processes to keep API response times low.

### Core User Personas

- **Developer**: Builds a professional profile, filters opportunities, applies with resumes/cover letters, and tracks verified career milestones.
- **Independent Recruiter**: Manages candidate pipelines independently without company affiliation.
- **Company Recruiter & Owner**: Collaborates within verified organizations, manages company job listings, reviews applications, and issues team invitations.
- **Admin**: Audits platform records, inspects email logs and failed queues, reviews verification requests, and monitors platform health.

---

## Key Features

### 👨‍💻 Developer Experience
- **Structured Profiles**: Portfolio, GitHub links, work preferences, categorized technical skills, and structured career history.
- **Application Pipeline**: One-click apply using pre-uploaded resume or custom cover letter; real-time status progression (`PENDING` → `REVIEW` → `ACCEPTED` / `REJECTED`).
- **Opportunity Discovery**: Filter jobs by skills, compensation, and location; bookmark listings with saved jobs.
- **Employment History**: Durable employment event logs capturing verified hiring, resignation, and termination events.

### 🏢 Recruiter & Company Workspace
- **Company Verification**: Multi-step company registration and administrative approval pipeline.
- **Team Management**: Role-based team invitations, membership join requests, and ownership delegation.
- **Pipeline Review**: Candidate review dashboard with instant resume preview via secure, short-lived signed URLs.
- **Concurrency-Controlled Hiring**: Transactional acceptance workflow using database row-level locking on the target job to prevent double-hire race conditions.

### 🛡️ Administrative & Platform Operations
- **Observability**: Real-time BullMQ queue health inspection, Redis connectivity checks, and persistent delivery audit records (`EmailLog`).
- **Platform Governance**: Company verification controls, user account status toggles, and featured job management.
- **Document Access**: On-demand signed URL generation for candidate verification documents.
- **Audit Trails**: Oversight of company-wide employment events and recruiter history logs.

---

## Roles & Permissions

| Role / Profile | Scope & Primary Responsibilities |
| :--- | :--- |
| **Developer** | Manages developer profile, skills, job applications, saved listings, and receives in-app notifications. |
| **Independent Recruiter** | Operates talent pipelines independently without company affiliation; manages personal recruiter history. |
| **Company Recruiter** | Executes hiring within authorized company boundaries; creates and manages company-scoped jobs. |
| **Company Owner** | Full company ownership; manages team invites, membership approvals, and company-wide hiring workflows. |
| **Admin** | Platform-wide oversight, queue telemetry, email audit logs, company verification, and system analytics. |

> **Architectural Note**: The database schema defines top-level identity roles (`DEVELOPER`, `RECRUITER`, `ADMIN`). Company ownership and recruiter affiliations are governed through relational entity bindings (`Company.ownerId`, `RecruiterProfile.companyId`), providing organizational hierarchies without hardcoding sub-roles into database enums.

---

## System Architecture

```mermaid
flowchart TD
    Browser["Client Browser<br/>(React 19 / Redux Toolkit / Tailwind v4)"] --> Proxy["src/proxy.js<br/>(Edge JWT Verification, Header Sanitization & Rate Limiting)"]
    
    Proxy --> App["Next.js 16 App Router<br/>(Server Components & API Routes)"]
    App --> Services["Domain Service Layer<br/>(Auth, Jobs, Applications, Companies)"]
    
    Services --> Prisma["Prisma ORM Client"]
    Prisma --> DB[("PostgreSQL Database<br/>(Relational Integrity & Transactions)")]
    
    Services --> Redis[("Redis Stack<br/>(Cache, Token Bucket & BullMQ)")]
    Services --> Queues["BullMQ Producers"]
    
    Queues --> Workers["Standalone Worker Processes<br/>(Email, Storage, Notifications, Cron)"]
    
    Workers --> Resend["Resend API<br/>(Transactional Email)"]
    Workers --> DB
    Workers --> Supabase["Supabase Storage<br/>(Object Lifecycle & Signed URLs)"]
    Services --> Supabase
```

### Request & Data Lifecycle

1. **Edge Request Ingestion (`src/proxy.js`)**: Inbound requests pass through the Next.js 16 Edge proxy. It validates JWTs using `jose`, strips caller-supplied `x-user-id` and `x-user-role` headers to prevent header spoofing, re-injects verified identity claims, handles transparent refresh token rotation, and enforces token-bucket rate limiting.
2. **Domain Layer Dispatch**: Validated requests hit App Router route handlers (`src/app/api/*`), which delegate business operations to domain services (`src/services/*`).
3. **Transactional Persistence**: Services interact with PostgreSQL through Prisma, executing multi-step updates inside database transactions with explicit error boundaries (`AppError`).
4. **Asynchronous Delegation**: Heavy I/O (email formatting, storage cleanup, notifications) is pushed to Redis via BullMQ queues, keeping HTTP response times minimal.
5. **Decoupled Worker Processing**: Standalone Node.js worker processes consume queue jobs with exponential backoff retries and idempotent delivery handling.

---

## Technology Stack

| Layer | Technologies | Implementation Highlights |
| :--- | :--- | :--- |
| **Framework & Runtime** | Next.js 16.2.6, React 19.2.4, Node.js | App Router architecture, modern Edge proxy pattern (`src/proxy.js`) |
| **Language & Tooling** | JavaScript / JSX, TypeScript (Tooling), `tsx` | High-performance worker execution via `tsx` with path aliases |
| **Styling & UI** | Tailwind CSS v4, Framer Motion, Lucide React | Modern design tokens, dynamic animations, accessible SVG iconography |
| **State & Networking** | Redux Toolkit, React Redux, Axios | Global client state management and credentialed API interceptors |
| **Data & ORM** | PostgreSQL, Prisma ORM 6.x | Foreign key constraints, unique indexes, interactive transactions |
| **Caching & Queues** | Redis Stack, `ioredis`, BullMQ 6.x | Token-bucket Lua script rate limiting, distributed job queues, worker retries |
| **Authentication** | `jose` (Edge proxy), `jsonwebtoken` (Node.js API), `bcrypt` | Dual-runtime JWT verification, HTTP-only secure cookies, hashed refresh tokens |
| **File Storage** | Supabase Storage (`@supabase/supabase-js`) | Pre-signed upload URLs, temporary-to-permanent file promotion pipeline |
| **Email Delivery** | Resend, React Email | High-deliverability transactional templates, durable `EmailLog` audit table |
| **Monitoring & Charts** | Recharts, Redis Insight | Real-time queue and administrative analytics dashboards |

---

## Data Model & Integrity

The relational data model is defined in `prisma/schema.prisma` and generated into `src/generated/prisma`.

### Key Entity Groups

- **Identity & Sessions**: `User`, `RefreshToken`, `VerificationOtp`
- **Talent & Profiles**: `DeveloperProfile`, `RecruiterProfile`, `Skill`
- **Organizations & Teams**: `Company`, `CompanyJoinRequest`, `RecruiterInvite`, `RecruiterHistory`
- **Hiring & Applications**: `Job`, `Application`, `SavedJob`
- **Tenure & Audit Records**: `EmploymentHistory`, `EmployementEvent`, `RecruiterEvent`
- **Operations & Media**: `Notification`, `EmailLog`, `File`

### Relational Integrity Highlights

- **Anti-Duplicate Application Constraint**: `@@unique([jobId, devProfileId])` guarantees a candidate cannot submit duplicate applications for the same job listing.
- **Anti-Duplicate Bookmarks**: `@@unique([devProfileId, jobId])` prevents duplicate saved listings.
- **Single-Profile Invariant**: One-to-one constraints ensure a user account maps strictly to at most one developer profile and one recruiter profile.
- **Hashed Session Persistence**: Refresh tokens are stored as SHA-256 hashes (`hashedToken`) alongside client device metadata, user agents, revocation flags, and expiration timestamps.
- **Schema Note**: The Prisma model is spelled `EmployementEvent` (with an extra `e`) in the schema. This matches the codebase; altering it requires a planned database migration.

---

## Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher (compatible with Next.js 16)
- **Package Manager**: `npm` (v10+)
- **Container Engine**: Docker Desktop or Docker Engine with Docker Compose (for local Redis)
- **PostgreSQL**: Local PostgreSQL 15+ or managed database instance (e.g., Neon)
- **Supabase Account**: Configured project storage bucket for resume/document storage
- **Resend Account**: API key for transactional emails

---

### Step-by-Step Installation

#### 1. Clone & Install Dependencies

```bash
git clone https://github.com/affan-asim/Devflow.git
cd Devflow
npm install
```

#### 2. Start Local Redis Infrastructure

Spin up Redis Stack Server and Redis Insight with Docker Compose:

```bash
docker compose up -d
```

- **Redis Server**: `localhost:6379`
- **Redis Insight Web GUI**: [http://localhost:5540](http://localhost:5540)

#### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Create .env manually and populate with the values below
touch .env
```

*(See the template in the [Environment Variables](#environment-variables) section below).*

#### 4. Setup Database & Migrations

Generate the Prisma Client and apply committed database migrations:

```bash
# Generate Prisma Client into src/generated/prisma
npx prisma generate

# Apply migrations to development database
npx prisma migrate dev
```

For environments with an existing migration history where schema changes should only be applied:
```bash
npx prisma migrate deploy
```

#### 5. Launch Development Server & Background Workers

In terminal 1 (Next.js web application):
```bash
npm run dev
```

In terminal 2 (BullMQ asynchronous workers):
```bash
npm run workers
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Environment Variables

Configure the following variables in `.env` in the repository root:

```env
# ==========================================
# Database (PostgreSQL / Neon)
# ==========================================
DATABASE_URL="postgresql://postgres:password@localhost:5432/mydevdb"

# ==========================================
# Authentication & Security
# ==========================================
SECRET_KEY="generate-a-secure-random-secret-key-min-32-chars"
NODE_ENV="development"

# ==========================================
# Redis (Queues, Rate Limiting & Cache)
# ==========================================
REDIS_URL="redis://localhost:6379"

# ==========================================
# Transactional Email (Resend)
# ==========================================
RESEND_API_KEY="re_your_resend_api_key"

# ==========================================
# File Storage (Supabase Storage)
# ==========================================
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-server-side-service-role-key"
S3_BUCKET_NAME="devflow-uploads"

NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-public-anon-key"

# ==========================================
# Application Public URLs
# ==========================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Variable Reference & Operational Scope

| Variable | Scope | Description & Current Handling |
| :--- | :--- | :--- |
| `DATABASE_URL` | Server | PostgreSQL connection string consumed by Prisma datasource. |
| `SECRET_KEY` | Server | Secret used by `jose` (in `proxy.js`) and `jsonwebtoken` (in `src/utils/auth.js`) for JWT signing and verification. |
| `REDIS_URL` | Server | Connection URL consumed by `src/app/api/redis/route.js`. *(Note: `src/lib/redis.js` and `rateLimiter.js` currently connect to `localhost:6379` by default; see roadmap).* |
| `RESEND_API_KEY` | Server | API key used by the email worker to dispatch emails via Resend. |
| `SUPABASE_URL` | Server | Supabase project API URL for backend storage interactions. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Privileged server-side key for file uploads and pre-signed URLs. **Never expose to client bundles.** |
| `S3_BUCKET_NAME` | Server | Bucket name used by Supabase Storage operations (name retained from earlier S3 configuration). |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Public project URL for client-side Supabase utilities. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Public anonymous key for client-side Supabase utilities. |
| `NEXT_PUBLIC_APP_URL` | Public | Base URL used to construct actionable invite links in email notifications. |

---

## Running the Application

### Development Mode

```bash
# Terminal 1: Web application server
npm run dev

# Terminal 2: BullMQ background workers (email, storage, notifications, cron)
npm run workers
```

### Production Deployment

In a production environment, run the Next.js web application and the BullMQ background workers as separate long-running processes:

```bash
# 1. Build the Next.js production bundle
npm run build

# 2. Start the production HTTP server
npm run start

# 3. Start workers in background service / container
npm run workers
```

---

## Background Workers

DevFlow isolates non-blocking and scheduled tasks using BullMQ queues backed by Redis:

| Worker Entry Point | Queue Name | Primary Responsibility | Retry Strategy |
| :--- | :--- | :--- | :--- |
| `src/workers/Email.worker.js` | `emails` | Dispatches transactional emails (verification, invites, status updates) and logs status to `EmailLog`. | 3 attempts; exponential backoff (1s initial) |
| `src/workers/notification.worker.js` | `notifications` | Asynchronously writes in-app user notifications. | 3 attempts; exponential backoff (1s initial) |
| `src/workers/storage.worker.js` | `storage` | Promotes temporary file uploads (`TEMP`) to permanent storage keys and deletes orphaned files. | 3 attempts; exponential backoff (1s initial) |
| `src/workers/jobExpiration.worker.js` | `job-expiration` | Daily scheduled cron job (midnight `Asia/Karachi`) to close expired job listings; runs immediate sweep on boot. | Failure logging & execution capture |

### Individual Worker Commands

For targeted debugging or running isolated containers per queue:

```bash
npm run email:worker            # Email queue worker
npm run notification:worker     # Notification queue worker
npm run storage:worker          # Storage queue worker
npm run job-expiration:worker   # Job expiration scheduler
npm run email:dev               # React Email live template preview
```

---

## Security Model

- **Edge Proxy Protection (`src/proxy.js`)**: Implements Next.js 16 conventions to inspect every request before it reaches App Router handlers. Strips client-provided `x-user-id` and `x-user-role` headers to prevent header-spoofing attacks, and replaces them with verified claims extracted from cryptographically validated JWTs.
- **Dual Runtime Strategy**: Uses Web-Crypto-compliant `jose` in the Edge Proxy and `jsonwebtoken` in Node.js server routes, adhering to Next.js runtime constraints.
- **Session Security**: Session tokens are passed via `httpOnly`, `sameSite: lax`, secure cookies (enabled when `NODE_ENV === "production"`).
- **Session Auditability**: Refresh tokens are stored as SHA-256 hashes in PostgreSQL alongside user-agent, IP, and expiration metadata.
- **Rate Limiting**: Sliding token-bucket rate limiter implemented in Redis protects API endpoints against brute-force attacks and abuse.
- **Pre-signed Storage Flow**: Uploads and downloads use time-limited pre-signed URLs (600s default TTL), ensuring private documents are never publicly exposed or directly proxied through the web server.

---

## Architectural Decisions & Production Roadmap

The following notes outline intentional implementation trade-offs and recommended hardening steps:

### 1. Availability vs. Rate-Limit Consistency (Fail-Open Trade-off)
- **Observed Behavior**: If Redis becomes temporarily unreachable, the rate limiter catches the error and fails open (allows requests through) rather than crashing the HTTP API.
- **Trade-off**: Prioritizes application availability over strict rate enforcement during Redis downtime.
- **Hardening Task**: Implement an in-memory circuit breaker for sensitive authentication endpoints (`/api/auth/login`, `/api/auth/register`).

### 2. Redis Connection Centralization
- **Observed Behavior**: `src/lib/redis.js` hardcodes `{ host: 'localhost', port: 6379 }`, and `src/services/rateLimiter/rateLimiter.js` calls `new Redis()` with default host/port. `process.env.REDIS_URL` is currently only consumed by the diagnostic `/api/redis` route.
- **Hardening Task**: Refactor `src/lib/redis.js` and `rateLimiter.js` to parse and utilize `process.env.REDIS_URL` so remote/clustered Redis instances can be configured via environment variables alone.

### 3. Concurrency Control in Hiring
- **Observed Behavior**: The hiring acceptance service executes inside a Prisma interactive transaction using row-level locking on the target `Job` record.
- **Benefit**: Guarantees that concurrent acceptance actions cannot create multiple accepted applications for a single open position.

### 4. Email Sandbox Sandbox Notice
- **Observed Behavior**: Email notification services (`src/services/auth/emailNotifications.js`) currently send to a hardcoded test address due to Resend sandbox restrictions.
- **Production Task**: Configure and verify a custom sending domain in Resend to enable dynamic recipient routing.

### 5. Refresh Token Invalidation at Logout
- **Observed Behavior**: Logging out clears HTTP cookies and flushes the Redis user session key, but does not currently mark the database `RefreshToken` record as `revoked: true`.

### 6. Storage Provider Alignment
- **Observed Behavior**: The active upload and download paths use `supabaseAdmin.storage`. The AWS S3 SDK packages remain declared in `package.json` from earlier S3-compatible configuration.
- **Cleanup Task**: Deprecate unused AWS SDK packages and normalize environment naming from `S3_BUCKET_NAME` to `SUPABASE_STORAGE_BUCKET`.

---

## Testing & Code Quality

- **Schema & Type Safety**:
  - Request bodies and parameters are validated at runtime using **Zod** schemas (`src/validations/*`).
  - Database access is strictly typed using the generated **Prisma Client** (`src/generated/prisma`).
- **ESLint & Tooling Note**:
  - Current configuration uses `eslint` and `eslint-config-next`.
  - *Known Tooling Issue*: A version discrepancy between ESLint 9 and `@typescript-eslint/typescript-estree` in the current devDependencies causes `npm run lint` to fail with a loader TypeError. Updating the linting toolchain or aligning TypeScript dependencies is tracked as a maintenance task.
- **Automated Testing Suite**:
  - `package.json` currently does not declare an `npm test` script.
  - Adding integration tests with Vitest or Playwright for critical authentication, hiring, and worker flows is recommended for production readiness.

---

## Project Directory Structure

```
dev-flow/
├── docker-compose.yml          # Local Redis Stack & Redis Insight services
├── package.json                # Project dependencies and npm scripts
├── prisma/
│   ├── migrations/             # PostgreSQL migration history (5 committed migrations)
│   └── schema.prisma           # Prisma schema definition
├── public/                     # Static brand assets
└── src/
    ├── app/
    │   ├── (auth)/             # Login, register, email verification pages
    │   ├── (public)/           # Landing page, jobs directory, recruiter directory
    │   ├── dashboard/          # Role-based dashboards (developer, recruiter, admin)
    │   ├── api/                # Next.js App Router API handlers
    │   ├── globals.css         # Tailwind CSS v4 styling
    │   └── layout.js           # Root layout with Redux store provider
    ├── components/             # Reusable UI & domain components
    │   ├── admin/              # Administrative overview and telemetry tables
    │   ├── auth/               # Authentication modals and forms
    │   ├── developer-dashboard/# Developer profile, applications, saved jobs
    │   ├── recruiter-dashboard/# Company jobs, applicant review, invite modals
    │   └── ui/                 # Accessible buttons, badges, modals, inputs
    ├── email/                  # React Email templates
    ├── generated/prisma/       # Generated Prisma ORM Client
    ├── lib/                    # Redis client, BullMQ queues, processors
    ├── proxy.js                # Next.js 16 Edge proxy (auth, headers, rate limiting)
    ├── services/               # Core domain business logic (auth, jobs, hiring)
    ├── utils/                  # Security, Prisma, Supabase, and S3 utilities
    ├── validations/            # Zod validation schemas
    └── workers/                # BullMQ background worker entry points
```

---

## Author & License

- **Author**: [Affan Asim](https://github.com/affan-asim)
- **License**: MIT
