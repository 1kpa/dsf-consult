import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getSession } from '@/lib/auth/session';
import { LoginForm } from '@/components/crm/LoginForm';

export const metadata: Metadata = {
  title: 'DSF Consult CRM — Sign In',
};

export const dynamic = 'force-dynamic';

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function CrmLoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();
  if (session) {
    redirect('/crm');
  }

  const params = await searchParams;
  const redirectTo = params.next && params.next.startsWith('/crm') ? params.next : '/crm';

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-6 py-16" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="text-3xl font-bold text-white">
            DSF<span className="text-sky-400">.</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">DSF Consult CRM</h1>
          <p className="mt-2 text-sm text-slate-400">Internal access only.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
          <LoginForm redirectTo={redirectTo} />
        </div>
      </div>
    </div>
  );
}
