import { NextResponse, type NextRequest } from "next/server";
import { getExpectedSessionToken, SESSION_COOKIE_NAME } from "@/lib/admin-auth";

// Next.js 16 renamed middleware.ts -> proxy.ts (and `middleware` -> `proxy`).
// Server Actions aren't reliably covered by this matcher, so every admin
// Server Action also calls requireAdminSession() itself (see admin-auth.ts).
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token !== getExpectedSessionToken()) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
