'use client';

import { useAuditForm } from '@/context/AuditFormContext';
import { trackEvent } from '@/lib/analytics';

export function BookingCTAButton({ bookingUrl }: { bookingUrl: string | null }) {
  const { open } = useAuditForm();

  if (bookingUrl) {
    return (
      <a
        href={bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('booking_clicked', { hasBookingUrl: true })}
        className="inline-flex rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 px-8 py-3.5 font-semibold text-white transition-all hover:shadow-lg hover:shadow-sky-500/30"
      >
        Book a Strategy Call
      </a>
    );
  }

  return (
    <button
      onClick={() => {
        trackEvent('booking_clicked', { hasBookingUrl: false });
        open();
      }}
      className="inline-flex rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 px-8 py-3.5 font-semibold text-white transition-all hover:shadow-lg hover:shadow-sky-500/30"
    >
      Take the Free Growth Assessment
    </button>
  );
}
