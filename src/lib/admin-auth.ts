import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const SESSION_COOKIE_NAME = "admin_session";
const COOKIE_NAME = SESSION_COOKIE_NAME;
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

/** Also used by proxy.ts, which reads the request cookie directly (no next/headers there). */
export function getExpectedSessionToken(): string {
  return createHmac("sha256", process.env.SESSION_SECRET!).update("admin").digest("hex");
}

export async function createSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, getExpectedSessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) return false;

  const expected = getExpectedSessionToken();
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Defense-in-depth check for every admin Server Action — proxy route matching alone isn't reliable for Server Functions. */
export async function requireAdminSession(): Promise<void> {
  if (!(await verifySession())) {
    redirect("/admin/login");
  }
}
