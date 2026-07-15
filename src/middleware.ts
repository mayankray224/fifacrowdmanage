import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In-memory sliding rate-limiter bucket for API routes
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_LIMIT = 60; // Max 60 requests
const RATE_LIMIT_WINDOW = 60000; // 1 minute window

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Security Headers (OWASP Compliance)
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self'; connect-src 'self' https://api.anthropic.com;"
  );
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self)"
  );

  // 2. API Rate Limiting for /api/ routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Fallback to localhost if header not present
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const now = Date.now();
    const rateData = rateLimitMap.get(ip);

    if (!rateData || now > rateData.resetTime) {
      rateLimitMap.set(ip, {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW,
      });
    } else {
      rateData.count++;
      if (rateData.count > RATE_LIMIT_LIMIT) {
        return new NextResponse(
          JSON.stringify({ error: "Too many requests. Please try again later." }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": Math.ceil((rateData.resetTime - now) / 1000).toString(),
            },
          }
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
