import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonError, jsonSuccess } from '@/lib/api-response';
import { requireSession } from '@/lib/auth/guard';
import { createAppointmentSchema } from '@/lib/validation/crm';
import { emitLeadEvent } from '@/lib/services/events';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid request body', 400);
  }

  const parsed = createAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || 'Invalid appointment', 400);
  }

  const lead = await prisma.lead.findUnique({ where: { id }, select: { id: true } });
  if (!lead) {
    return jsonError('Lead not found', 404);
  }

  try {
    const appointment = await prisma.$transaction(async (tx) => {
      const created = await tx.appointment.create({
        data: {
          leadId: id,
          scheduledFor: new Date(parsed.data.scheduledFor),
          type: parsed.data.type,
          notes: parsed.data.notes || null,
        },
      });
      await tx.leadActivity.create({
        data: {
          leadId: id,
          userId: session.sub,
          type: 'APPOINTMENT_CREATED',
          message: `Appointment created for ${created.scheduledFor.toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}`,
        },
      });
      return created;
    });

    await emitLeadEvent({ type: 'lead.appointment_created', leadId: id, data: { appointmentId: appointment.id } });

    return jsonSuccess({ appointment: { id: appointment.id } }, 201);
  } catch (err) {
    return jsonError('Unable to create appointment right now.', 500, err);
  }
}
