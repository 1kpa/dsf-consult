import { getSession, type SessionPayload } from './session';
import { jsonError } from '@/lib/api-response';

/**
 * Defense-in-depth session check for CRM API routes. `proxy.ts` already
 * blocks unauthenticated requests to /api/crm/* at the edge of the app, but
 * every route re-checks here too, in case the proxy matcher is ever changed.
 */
export async function requireSession(): Promise<
  { session: SessionPayload; error: null } | { session: null; error: Response }
> {
  const session = await getSession();
  if (!session) {
    return { session: null, error: jsonError('Not authenticated', 401) };
  }
  return { session, error: null };
}
