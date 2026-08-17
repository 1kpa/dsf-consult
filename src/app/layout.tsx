import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { AuditFormProvider } from '@/context/AuditFormContext';
import { AuditFormModal } from '@/components/audit-form/AuditFormModal';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const poppins = Poppins({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DSF Consult | Build a Business. Build the System. Scale Smarter.',
  description:
    'DSF Consult helps entrepreneurs and businesses build the systems behind sustainable growth — from idea to infrastructure, from enquiry to customer.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dsfconsult.com',
    siteName: 'DSF Consult',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${poppins.variable} bg-slate-950 text-slate-50 antialiased`}
        style={{ backgroundColor: '#0a0a0a', color: '#f9f9f9' }}
      >
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-transparent to-slate-950" />
        </div>
        <AuditFormProvider>
          <main className="relative">{children}</main>
          <AuditFormModal />
        </AuditFormProvider>
      </body>
    </html>
  );
}
