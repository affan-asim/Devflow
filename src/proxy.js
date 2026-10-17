import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { publicKey } from "./utils/redisKeyNames";
import { tokenBucket } from "./services/rateLimiter/rateLimiter";

const PUBLIC_ROUTES = [
    '/',
    '/login',
    '/admin/login',
    '/register',
    '/verify-email',
    '/recruiters'
];

const PUBLIC_APIS = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/email-verify',
    '/api/auth/refresh',
    '/api/test',
    '/api/auth/resend-otp'
];

const JWT_SECRET = new TextEncoder().encode(process.env.SECRET_KEY || 'your-secret-key');

export async function proxy(req) {
    try {
        const { pathname } = req.nextUrl;
        const accessToken = req.cookies.get('access-token')?.value;
        const refreshToken = req.cookies.get('refresh-token')?.value;

        const isApiRoute = pathname.startsWith('/api');
        const isRecruiterDirectoryApi = req.method === 'GET' && (
            pathname === '/api/profile/recruiter/general' ||
            /^\/api\/profile\/recruiter\/general\/[^/]+$/.test(pathname)
        );
        const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || (isApiRoute && (PUBLIC_APIS.includes(pathname) || isRecruiterDirectoryApi));
        const isPublicApi = isApiRoute && (PUBLIC_APIS.includes(pathname) || isRecruiterDirectoryApi);
        let decoded = null;
        // let ip = req.ip;
        const ip = req.ip;

        // if (!ip) {
        //     const forwardedFor = req.headers.get('x-forwarded-for');
        //     ip = forwardedFor ? forwardedFor.split(',')[0].trim() : req.headers.get('x-real-ip') || '127.0.0.1';
        // }

        if (accessToken) {
            try {
                const { payload } = await jwtVerify(accessToken, JWT_SECRET);
                decoded = payload;
            } catch (error) {
                console.log("Access token invalid or expired...");
            }
        }

        if (!decoded && refreshToken && pathname !== '/api/auth/refresh') {
            const refreshResponse = await fetch(`${req.nextUrl.origin}/api/auth/refresh`, {
                headers: { 'Cookie': `refresh-token=${refreshToken}` },
                method: "POST"
            });

            if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                const { payload } = await jwtVerify(data.accessToken, JWT_SECRET);
                decoded = payload;

                const res = NextResponse.next({
                    request: {
                        headers: new Headers({
                            ...Object.fromEntries(req.headers.entries()),
                            'x-user-id': decoded.userId.toString(),
                            'x-user-role': decoded.role,
                        })
                    }
                });

                const cookies = refreshResponse.headers.getSetCookie();
                cookies.forEach((cookie) => res.headers.append('set-cookie', cookie));

                return res;
            }
        }

        if (isApiRoute) {
            if (isPublicApi) {
                try {
                    const res = await tokenBucket(ip || decoded?.email || decoded?.userId || 'unknown');
                    if (!res) {
                        return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
                    };
                } catch (error) {
                    console.log('Error in redis, Bypassing rate limiter', error);
                }
            }
            else if (!isPublicApi && decoded) {
                try {
                    const res = await tokenBucket(decoded.userId || decoded.email);
                    if (!res) {
                        return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
                    };
                } catch (error) {
                    console.log('Error in redis, Bypassing rate limiter', error);
                }
            } else {
                try {
                    const res = await tokenBucket(ip || decoded?.email || decoded?.userId || 'unknown');
                    if (!res) {
                        return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
                    };
                } catch (error) {
                    console.log('Error in redis, Bypassing rate limiter', error);
                }
            }
        }

        if (decoded && isPublicRoute && !isApiRoute && pathname !== "/" && pathname !== "/recruiters") {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        if (isPublicRoute) {
            if (isPublicApi) {
                const requestHeaders = new Headers(req.headers);
                // Never trust identity headers supplied by the caller. Public
                // endpoints may use identity only when it came from a verified JWT.
                requestHeaders.delete('x-user-id');
                requestHeaders.delete('x-user-role');
                if (decoded) {
                    requestHeaders.set('x-user-id', String(decoded.userId));
                    requestHeaders.set('x-user-role', String(decoded.role));
                }
                return NextResponse.next({ request: { headers: requestHeaders } });
            }
            return NextResponse.next();
        }

        if (!decoded) {
            if (isApiRoute) {
                return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/login', req.url));
        }

        const requestHeaders = new Headers(req.headers);
        requestHeaders.set('x-user-id', decoded.userId);
        requestHeaders.set('x-user-role', decoded.role);

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });

    } catch (error) {
        console.error("MIDDLEWARE CRITICAL ERROR:", error);
        if (req.nextUrl.pathname.startsWith('/api')) {
            return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
        }
        return NextResponse.redirect(new URL('/login', req.url));
    }
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)',
    ],
};
