/**
 * AdgenAI — Edge Middleware (Next.js 16)
 *
 * Adds security response headers to every non-static request.
 * Auth protection is handled per-page via NextAuth session checks.
 *
 * Next.js 16 middleware conventions:
 *  - Export a named `middleware` function (unchanged)
 *  - Export a `config` object with a `matcher` array (unchanged)
 *  - The `runtime` export is optional; omitting it defaults to "edge"
 */

import { type NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}

export const config = {
  /*
   * Match every route EXCEPT:
   *  - _next/static  (static assets)
   *  - _next/image   (image optimisation)
   *  - favicon.ico
   *  - public files (png, jpg, svg, etc.)
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|otf|eot)).*)",
  ],
};
