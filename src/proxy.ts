import { NextResponse, type NextRequest } from "next/server";
import { getExpectedSessionToken, SESSION_COOKIE_NAME } from "@/lib/admin-auth";

// Next.js 16 renamed middleware.ts -> proxy.ts (and `middleware` -> `proxy`).
// Server Actions aren't reliably covered by this matcher, so every admin
// Server Action also calls requireAdminSession() itself (see admin-auth.ts).

// When set (in production), the internal "Дизайн тащит" student base is served
// on its own host and hidden from the public foliodeck host. Unset locally →
// single-host behaviour (everything reachable, no rewrites).
const DESIGNER_HOST = process.env.DESIGNER_HOST;

/** Paths that make up the student base — hidden on every non-DESIGNER_HOST host. */
function isStudentBasePath(pathname: string): boolean {
  return (
    pathname === "/designer" ||
    pathname.startsWith("/designer/") ||
    pathname === "/admin/designers" ||
    pathname.startsWith("/admin/designers/") ||
    pathname === "/admin/taxonomy" ||
    pathname.startsWith("/admin/taxonomy/")
  );
}

/** What the student-base host is allowed to serve (everything else → 404). */
function allowedOnDesignerHost(pathname: string): boolean {
  return (
    pathname === "/" ||
    isStudentBasePath(pathname) ||
    pathname === "/admin/login" ||
    pathname.startsWith("/api/")
  );
}

function needsAuth(pathname: string): boolean {
  if (pathname === "/admin/login") return false;
  return (
    pathname.startsWith("/admin") ||
    pathname === "/designer" ||
    pathname.startsWith("/designer/")
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";
  const onDesignerHost = Boolean(DESIGNER_HOST) && host === DESIGNER_HOST;

  // --- Host isolation ---
  if (onDesignerHost) {
    if (!allowedOnDesignerHost(pathname)) {
      return new NextResponse(null, { status: 404 });
    }
  } else if (DESIGNER_HOST && isStudentBasePath(pathname)) {
    // Public foliodeck host(s) never expose the student base.
    return new NextResponse(null, { status: 404 });
  }

  // --- Auth gate --- (on the designer host "/" is the base, gate it like /designer)
  const authPath = onDesignerHost && pathname === "/" ? "/designer" : pathname;
  if (needsAuth(authPath)) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (token !== getExpectedSessionToken()) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // --- Root of the designer host shows the base directly ---
  if (onDesignerHost && pathname === "/") {
    return NextResponse.rewrite(new URL("/designer", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Everything except Next internals and static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
