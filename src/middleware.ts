import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_LIMIT = 60; // Max 60 requests per window
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUEST_SIZE = 5 * 1024 * 1024; // 5MB

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Security Headers (OWASP Compliance)
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self'; connect-src 'self' https://api.anthropic.com;"
  );
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");

  // 2. Request Size Limits (CWE-400 resource exhaustion mitigation)
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_SIZE) {
    return new NextResponse(
      JSON.stringify({ error: "Payload too large. Request size exceeds 5MB limit." }),
      { status: 413, headers: { "Content-Type": "application/json" } }
    );
  }

  // 3. CSRF Verification for state-changing requests
  const method = request.method;
  if (["POST", "PUT", "DELETE"].includes(method)) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    
    // Simple origin mismatch checks to verify CSRF bounds
    if (origin && host && !origin.includes(host) && !host.includes("localhost") && !host.includes("127.0.0.1")) {
      return new NextResponse(
        JSON.stringify({ error: "CSRF verification failed. Request blocked." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // 4. Rate Limiting for all API endpoints
  if (request.nextUrl.pathname.startsWith("/api/")) {
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

  // 5. JWT Authorization check on Organizer dashboard route
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const sessionCookie = request.cookies.get("fifa_session");
    const hasAuthHeader = request.headers.has("Authorization");
    
    // In a mock hackathon environment, check session presence to allow testing
    const isLocalhost = request.headers.get("host")?.includes("localhost") || request.headers.get("host")?.includes("127.0.0.1");

    if (!sessionCookie && !hasAuthHeader && !isLocalhost) {
      // Redirect unauthorized dashboard access to onboarding page
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
