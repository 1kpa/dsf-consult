import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonError, jsonSuccess } from '@/lib/api-response';
import { requireSession } from '@/lib/auth/guard';
import { createNoteSchema } from '@/lib/validation/crm';
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

  const parsed = createNoteSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || 'Invalid note', 400);
  }

  const lead = await prisma.lead.findUnique({ where: { id }, select: { id: true } });
  if (!lead) {
    return jsonError('Lead not found', 404);
  }

  try {
    const note = await prisma.$transaction(async (tx) => {
      const created = await tx.leadNote.create({
        data: { leadId: id, authorId: session.sub, content: parsed.data.content },
      });
      await tx.leadActivity.create({
        data: { leadId: id, userId: session.sub, type: 'NOTE', message: 'Note added' },
      });
      return created;
    });

    await emitLeadEvent({ type: 'lead.note_added', leadId: id, data: { noteId: note.id } });

    return jsonSuccess({ note: { id: note.id } }, 201);
  } catch (err) {
    return jsonError('Unable to add note right now.', 500, err);
  }
}
