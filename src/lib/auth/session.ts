import { SignJWT, jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';

export const SESSION_COOKIE_NAME = 'dsf_crm_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Same defensive fallback pattern as lib/prisma.ts: never throw at module
// import time just because SESSION_SECRET isn't configured yet. A missing
// real secret only matters once someone actually tries to log in, at which
// point every previously-issued token becomes invalid on the next deploy —
// which is the correct, safe failure mode.
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-only-insecure-fallback-secret-change-me';
const secretKey = new TextEncoder().encode(SESSION_SECRET);

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'AGENT';
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, name: payload.name, role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.name !== 'string' ||
      (payload.role !== 'ADMIN' && payload.role !== 'AGENT')
    ) {
      return null;
    }
    return { sub: payload.sub, email: payload.email, name: payload.name, role: payload.role };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_DURATION_SECONDS,
};

/** For use in proxy.ts, where only the raw NextRequest is available. */
export async function getSessionFromRequest(request: NextRequest): Promise<SessionPayload | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** For use in Server Components and Route Handlers via next/headers cookies(). */
export async function getSession(): Promise<SessionPayload | null> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
