/**
 * Thin analytics abstraction. No external provider is wired up yet — events
 * are logged in development and silently forwarded to `gtag`/`fbq` if a
 * future GA4 or Meta Pixel script defines them on `window`. Call sites don't
 * need to change when a real provider is added.
 */

export type AnalyticsEvent =
  | 'systems_audit_started'
  | 'systems_audit_step_completed'
  | 'systems_audit_submitted'
  | 'booking_clicked';

type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackEvent(event: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
  if (typeof window === 'undefined') return;

  if (typeof window.gtag === 'function') {
    window.gtag('event', event, payload);
  }
  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', event, payload);
  }
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[analytics]', event, payload);
  }
}
