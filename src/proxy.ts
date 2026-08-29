import { NextResponse, type NextRequest } from "next/server";
import { getExpectedSessionToken, SESSION_COOKIE_NAME } from "@/lib/admin-auth";

// Next.js 16 renamed middleware.ts -> proxy.ts (and `middleware` -> `proxy`).
// Server Actions aren't reliably covered by this matcher, so every admin
// Server Action also calls requireAdminSession() itself (see admin-auth.ts).

// Two hosts in production, split by DESIGNER_HOST:
//   • public foliodeck host  — only the public gallery + info pages. No admin,
//     no student base.
//   • internal host (DESIGNER_HOST) — the "Дизайн тащит" student base at `/`
//     plus the FULL admin (every section: portfolios, submissions, graduates,
//     all tags).
// Unset locally → single-host behaviour: everything reachable, no rewrites.
const DESIGNER_HOST = process.env.DESIGNER_HOST;

function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isStudentBasePath(pathname: string): boolean {
  return pathname === "/designer" || pathname.startsWith("/designer/");
}

/** What the internal host is allowed to serve (everything else → 404). */
function allowedOnDesignerHost(pathname: string): boolean {
  return (
    pathname === "/" ||
    isAdminPath(pathname) ||
    isStudentBasePath(pathname) ||
    pathname.startsWith("/api/")
  );
}

function needsAuth(pathname: string): boolean {
  if (pathname === "/admin/login") return false;
  return isAdminPath(pathname) || isStudentBasePath(pathname);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";
  const onDesignerHost = Boolean(DESIGNER_HOST) && host === DESIGNER_HOST;

  // --- Host isolation ---
  if (DESIGNER_HOST) {
    if (onDesignerHost) {
      if (!allowedOnDesignerHost(pathname)) {
        return new NextResponse(null, { status: 404 });
      }
    } else if (isAdminPath(pathname) || isStudentBasePath(pathname)) {
      // The public foliodeck host exposes neither the admin nor the student base.
      return new NextResponse(null, { status: 404 });
    }
  }

  // --- Auth gate --- (on the internal host "/" is the base, gate it like /designer)
  const authPath = onDesignerHost && pathname === "/" ? "/designer" : pathname;
  if (needsAuth(authPath)) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (token !== getExpectedSessionToken()) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // --- Root of the internal host shows the student base directly ---
  if (onDesignerHost && pathname === "/") {
    return NextResponse.rewrite(new URL("/designer", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Everything except Next internals and static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
