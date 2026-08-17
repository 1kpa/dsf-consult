import { cookies } from 'next/headers';
import { jsonSuccess } from '@/lib/api-response';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return jsonSuccess({});
}
