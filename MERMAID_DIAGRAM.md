# DevFlow Authentication & Authorization Flow

## Sequence Diagram (Mermaid)

```mermaid
sequenceDiagram
    participant C as Client
    participant P as proxy.js (middleware)
    participant R as Refresh Service
    participant S as Service Layer
    participant DB as Prisma DB
    participant J as JWT Utils

    %% === Step 1: Login ===
    C->>P: POST /api/auth/login (email, password)
    P->>R: loginUser (verify password via bcrypt)
    R->>DB: prisma.user.findUnique({where: {email}})
    DB-->>R: user record (with password hash)
    R->>R: compare password
    R-->>P: user object
    P->>J: generateToken(user.id, user.role, 'access')
    P->>J: generateToken(user.id, user.role, 'refresh')
    P->>C: Set cookies: access-token, refresh-token
    P-->>C: 200 + role

    %% === Step 2: Protected API Request ===
    C->>P: GET /api/jobs/[id] (with access-token cookie)
    
    %% === Step 3: JWT Verification in Proxy ===
    P->>P: extract access-token from cookies
    P->>J: jwtVerify(accessToken, JWT_SECRET)
    alt Token valid
        P->>P: decoded = payload
    else Token invalid/expired
        P->>P: extract refresh-token from cookies
        P->>R: POST /api/auth/refresh (refresh-token)
        R->>R: verify refresh token against DB
        alt Refresh valid
            R->>J: generate new accessToken
            R->>J: generate new refreshToken
            R->>DB: create new refresh token (revoke old one)
            R-->>P: new tokens
            P->>C: Set new cookies
            P->>P: decoded = new payload
        else Refresh invalid/expired
            P->>C: 401 Unauthorized
        end
    end

    %% === Step 4: Rate Limiting ===
    P->>P: isApiRoute check
    alt isPublicApi
        P->>P: tokenBucket(ip) - shared rate limit
    else authenticated API route
        P->>P: tokenBucket(decoded.userId) - per-user rate limit
    end
    alt Rate limit exceeded
        P->>C: 429 Too Many Requests
    end

    %% === Step 5: Route Handler Authorization ===
    P->>C: next() with x-user-id & x-user-role headers
    
    C->>S: GET /api/jobs/[id] (headers: x-user-id, x-user-role)
    alt Route is admin-only (e.g. /api/admin/users/[id])
        S->>S: if userRole !== ROLE.ADMIN → 403 Forbidden
    alt Route is recruiter-only (e.g. /api/jobs/[id])
        S->>S: if userRole !== ROLE.RECRUITER → 403 Forbidden
        S->>S: if recruiter, validate company ownership via profile
    else Route is developer/ public
        S->>S: proceed (no extra role check)
    end

    %% === Step 6: Service Layer Checks ===
    S->>DB: prisma.job.findUnique/findFirst({where: {id, companyId: profile.companyId}})
    alt Recruiter access check
        S->>DB: validate recruiter owns the job (profile.companyId === job.companyId)
    end
    DB-->>S: job data (or null)

    %% === Step 7: Response ===
    alt Job found + authorized
        S->>C: 200 + job data
    alt Not authorized
        S->>C: 403 Forbidden + "Forbidden. Only recuiter can update job."
    alt Not found
        S->>C: 404 Not found
    alt Auth failed earlier
        S->>C: 401 Unauthorized
    end
```

## Source-File Mapping

| Participant | File(s) | Key Functions/Code |
|---|---|---|
| **Client** | `browser` | Sends requests with cookies; reads `x-user-id` / `x-user-role` headers |
| **proxy.js (middleware)** | `src/proxy.js` | JWT verification (`jwtVerify`), cookie handling, refresh-token flow, rate limiting (`tokenBucket`), identity-header injection (`x-user-id`, `x-user-role`), route matching |
| **Refresh Service** | `src/services/auth/refreshService.js` | Refresh token validation against DB (`prisma.refreshToken.findFirst`), token revocation, new token generation |
| **JWT Utils** | `src/utils/auth.js` / `src/services/auth/loginService.js` | `generateToken` (jwt.sign), `verifyToken` (jwt.verify), token creation with role/email |
| **Service Layer** | `src/services/jobs/jobService.js` | `getJob(id, role, userId)` - role-based access; `validateRecruiterCompany(userId, data)` - company ownership check |
| **Prisma DB** | `src/generated/prisma/client` | `prisma.job.findUnique`, `prisma.user.findUnique`, `prisma.recruiterProfile.findUnique`, `prisma.company.findUnique` |
| **Auth Login** | `src/app/api/auth/login/route.js` | `loginUser` → password verify → token generation → set httpOnly cookies |
| **AppError** | `src/utils/AppError.js` | Error class with `statusCode` property for consistent error responses |

## Authorization Analysis

### Where Checks happen:

1. **proxy.js (middleware layer)**:
   - ✅ JWT verification (authentication)
   - ✅ Rate limiting
   - ✅ Setting `x-user-id` and `x-user-role` headers
   - ❌ Does NOT independently enforce role-based authorization

2. **Route handlers** (e.g., `src/app/api/jobs/[id]/route.js`, `src/app/api/admin/users/[id]/route.js`):
   - ✅ Read `x-user-id` and `x-user-role` from headers
   - ✅ Early returns 403 if role doesn't match (e.g., `if (userRole !== ROLE.ADMIN) → 403`)
   - ✅ Recruiter routes check `userRole !== ROLE.RECRUITER`

3. **Service layer** (e.g., `src/services/jobs/jobService.js`):
   - ✅ `getJob(id, role, userId)` checks recruiter company ownership
   - ✅ `validateRecruiterCompany(userId, data)` ensures user can only modify their own company's jobs
   - ✅ Admin routes in service layer check `role === ROLE.ADMIN`

### Key Findings:

- **proxy.js authenticates** (JWT verification, refresh token flow) and **injects identity** (`x-user-id`, `x-user-role`) into every downstream request.
- **Authorization is NOT independently enforced in proxy.js** — it relies on each route handler and/or service layer to check roles.
- **Each protected endpoint independently validates identity**: admin routes check for `ROLE.ADMIN`, recruiter routes check for `ROLE.RECRUITER`, and some routes (like `/api/jobs/[id]`) validate resource ownership in the service layer.
- **Rate limiting** operates in the proxy: public APIs use IP-based limiting, authenticated APIs use per-user `decoded.userId` or `decoded.email`.
- **Password verification** uses bcrypt (`loginService.js` → `verifyPassword`).
- **Refresh token storage** uses a dedicated `refreshToken` Prisma model with hashed tokens, device info, IP, and user agent for revocation tracking.
- **On token refresh**, the old refresh token is revoked (`revoked: true`) and a new pair is issued with updated cookies.
- **Public API endpoints** (`PUBLIC_APIS`) skip JWT verification entirely but still undergo rate limiting.
- **Unauthenticated responses**: 401 `{"success": false, "error": "Unauthorized access"}` for API routes; 302 redirect to `/login` for non-API routes.
- **Authorization failures**: 403 with descriptive messages like `"Forbidden. Only admin can..."` or `"Forbidden. Only recuiter can..."`.

## Unresolved Security Questions

1. **Refresh token scope**: Refresh tokens are tied to `userId` and validated via DB, but the proxy also allows refresh via `pathname !== '/api/auth/refresh'` check — need to verify if refresh endpoint itself has adequate rate limiting independent of the general proxy flow.

2. **Token leakage via headers**: The proxy sets `x-user-id` and `x-user-role` on every request (including public routes that allow identity headers). Comment in proxy.js states "Never trust identity headers supplied by the caller. Public endpoints may use identity only when it came from a verified JWT." — but the code still sets these headers on public route responses.

3. **CSRF exposure**: Login sets httpOnly cookies, which protects against CSRF for token theft, but the refresh endpoint accepts refresh-token via cookie only — verify same-site cookie configuration is adequate.

4. **Rate limiter persistence**: The `tokenBucket` Lua script operates on per-user keys; need to confirm if cleanup of expired user keys happens or if Redis could accumulate stale entries.

5. **Password hashing rounds**: bcrypt uses cost factor of 10 (`bcrypt.hash(password, 10)`) — assess if this meets the project's security requirements versus higher-cost setups.