import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getSession } from '@/lib/auth/session';
import { CrmShell } from '@/components/crm/CrmShell';

export const dynamic = 'force-dynamic';

export default async function CrmDashboardLayout({ children }: { children: ReactNode }) {
  // Defense in depth: proxy.ts already redirects unauthenticated requests
  // away from /crm/*, but this layout re-checks in case that ever changes.
  const session = await getSession();
  if (!session) {
    redirect('/crm/login');
  }

  return (
    <CrmShell user={{ name: session.name, email: session.email, role: session.role }}>
      {children}
    </CrmShell>
  );
}
