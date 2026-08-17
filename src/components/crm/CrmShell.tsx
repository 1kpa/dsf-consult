'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';

interface CrmShellProps {
  user: { name: string; email: string; role: string };
  children: ReactNode;
}

const NAV_LINKS = [
  { href: '/crm', label: 'Dashboard' },
  { href: '/crm/leads', label: 'Leads' },
  { href: '/crm/pipeline', label: 'Pipeline' },
  { href: '/crm/invoices', label: 'Invoices' },
  { href: '/crm/finance', label: 'Finance' },
];

export function CrmShell({ user, children }: CrmShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/crm/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="flex min-h-screen">
        <aside className="hidden w-60 shrink-0 border-r border-white/10 bg-white/[0.02] md:flex md:flex-col">
          <div className="px-6 py-6 text-xl font-bold text-white">
            DSF<span className="text-sky-400">.</span> <span className="text-sm font-medium text-slate-400">CRM</span>
          </div>
          <nav className="flex-1 space-y-1 px-3">
            {NAV_LINKS.map((link) => {
              const active = link.href === '/crm' ? pathname === '/crm' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active ? 'bg-sky-500/15 text-sky-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-white/10 px-3 py-4">
            <Link href="/" className="block rounded-lg px-3 py-2 text-sm text-slate-500 hover:text-white">
              ← View website
            </Link>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-6 py-4">
            <div className="text-sm text-slate-400 md:hidden">
              DSF<span className="text-sky-400">.</span> CRM
            </div>
            <div className="hidden text-sm text-slate-400 md:block">Internal system</div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-white">{user.name}</div>
                <div className="text-xs text-slate-500">{user.role}</div>
              </div>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-white/20 hover:text-white disabled:opacity-60"
              >
                {signingOut ? 'Signing out…' : 'Sign Out'}
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-x-hidden px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
