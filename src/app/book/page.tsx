import type { Metadata } from 'next';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/sections/Footer';
import { BookingCTAButton } from '@/components/BookingCTAButton';

export const metadata: Metadata = {
  title: 'Book a Strategy Call — DSF Consult',
  description: 'Book a strategy call with a DSF Consult systems specialist.',
};

const WHAT_TO_EXPECT = [
  'A walkthrough of exactly where your current lead process is leaking opportunities.',
  'A tailored breakdown of which DSF Consult systems fit your business.',
  'A clear, no-pressure recommendation — with real numbers, not guesswork.',
];

export default function BookPage() {
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || null;

  return (
    <>
      <Navigation />
      <main className="w-full">
        <section className="relative w-full px-6 pb-20 pt-32 md:pt-40">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-sm font-medium uppercase tracking-wide text-sky-300">Strategy Call</div>
            <h1 className="mt-4 text-3xl font-extrabold text-white md:text-5xl">
              Let&apos;s build your system.
            </h1>

            {bookingUrl ? (
              <p className="mt-5 text-lg text-slate-300">
                Pick a time that works for you — we&apos;ll come prepared to talk through your current lead
                process.
              </p>
            ) : (
              <p className="mt-5 text-lg text-slate-300">
                Strategy call booking is being configured. Take the Growth Assessment and our team will
                contact you.
              </p>
            )}

            <div className="mt-8">
              <BookingCTAButton bookingUrl={bookingUrl} />
            </div>

            <div className="mx-auto mt-16 max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">What to expect</h2>
              <ul className="mt-4 space-y-3">
                {WHAT_TO_EXPECT.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="mt-0.5 text-sky-400">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
