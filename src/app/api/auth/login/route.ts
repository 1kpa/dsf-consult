import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { jsonError, jsonSuccess } from '@/lib/api-response';
import { loginSchema } from '@/lib/validation/auth';
import { verifyPassword } from '@/lib/auth/password';
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const GENERIC_ERROR = 'Invalid email or password.';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`login:${ip}`, { windowMs: 10 * 60 * 1000, max: 10 });
  if (!rateLimit.allowed) {
    return jsonError('Too many sign-in attempts. Please try again shortly.', 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid request body', 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(GENERIC_ERROR, 400);
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
    if (!user) {
      return jsonError(GENERIC_ERROR, 401);
    }

    const passwordValid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!passwordValid) {
      return jsonError(GENERIC_ERROR, 401);
    }

    const token = await createSessionToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);

    return jsonSuccess({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    return jsonError('Unable to sign in right now. Please try again shortly.', 500, error);
  }
}
