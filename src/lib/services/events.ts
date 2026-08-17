/**
 * Internal lead-lifecycle event bus. This is the seam future integrations
 * (Twilio, Resend, SendGrid, n8n, Make, Zapier, Meta/Google Ads conversions,
 * Calendly, Google Calendar, OpenAI/Claude follow-up drafting, etc.) attach
 * to — none of them require touching the lead creation/mutation logic in the
 * API routes. For now the only registered handler is a structured log.
 */

export type LeadEventType =
  | 'lead.created'
  | 'lead.duplicate_submission'
  | 'lead.stage_changed'
  | 'lead.status_changed'
  | 'lead.note_added'
  | 'lead.follow_up_scheduled'
  | 'lead.contact_recorded'
  | 'lead.appointment_created'
  | 'lead.won'
  | 'lead.lost';

export interface LeadEvent {
  type: LeadEventType;
  leadId: string;
  occurredAt: string;
  data?: Record<string, unknown>;
}

type LeadEventHandler = (event: LeadEvent) => void | Promise<void>;

function logHandler(event: LeadEvent) {
  console.log(`[lead-event] ${event.type}`, { leadId: event.leadId, ...event.data });
}

const handlers: LeadEventHandler[] = [logHandler];

/** Future integrations register here instead of modifying lead logic directly. */
export function registerLeadEventHandler(handler: LeadEventHandler) {
  handlers.push(handler);
}

export async function emitLeadEvent(event: Omit<LeadEvent, 'occurredAt'>): Promise<void> {
  const fullEvent: LeadEvent = { ...event, occurredAt: new Date().toISOString() };
  await Promise.all(
    handlers.map((handler) =>
      Promise.resolve(handler(fullEvent)).catch((error: unknown) => {
        console.error(`[lead-event] handler failed for ${event.type}`, error);
      })
    )
  );
}
