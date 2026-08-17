import type { NextRequest } from 'next/server';
import type { ActivityType, LeadStatus, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { jsonError, jsonSuccess } from '@/lib/api-response';
import { requireSession } from '@/lib/auth/guard';
import { updateLeadSchema } from '@/lib/validation/crm';
import { LEAD_STATUS_LABELS, FOLLOW_UP_TYPE_LABELS, STAGE_KEY_TO_STATUS, type PipelineStageKey } from '@/lib/pipeline';
import { emitLeadEvent } from '@/lib/services/events';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid request body', 400);
  }

  const parsed = updateLeadSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || 'Invalid update', 400);
  }
  const data = parsed.data;

  const lead = await prisma.lead.findUnique({ where: { id }, include: { pipelineStage: true } });
  if (!lead) {
    return jsonError('Lead not found', 404);
  }

  const updates: Prisma.LeadUpdateInput = {};
  const activities: { type: ActivityType; message: string }[] = [];
  let nextStatus: LeadStatus | undefined;

  try {
    if (data.pipelineStageKey) {
      const stage = await prisma.pipelineStage.findUnique({ where: { key: data.pipelineStageKey } });
      if (!stage) {
        return jsonError('Invalid pipeline stage', 400);
      }
      if (stage.id !== lead.pipelineStageId) {
        updates.pipelineStage = { connect: { id: stage.id } };
        const stageKey = stage.key as PipelineStageKey;
        if (stageKey === 'won') {
          nextStatus = 'WON';
          activities.push({ type: 'WON', message: 'Marked Won' });
        } else if (stageKey === 'lost') {
          nextStatus = 'LOST';
          activities.push({ type: 'LOST', message: 'Marked Lost' });
        } else {
          nextStatus = STAGE_KEY_TO_STATUS[stageKey] ?? nextStatus;
          activities.push({
            type: 'STAGE_CHANGE',
            message: `Stage changed from "${lead.pipelineStage?.name ?? 'Unassigned'}" to "${stage.name}"`,
          });
        }
      }
    }

    // Direct status change (e.g. dedicated Mark Won / Mark Lost / Nurture controls)
    // only applies when no stage move already determined the status above.
    if (data.status && nextStatus === undefined && data.status !== lead.status) {
      nextStatus = data.status;
      if (data.status === 'WON' || data.status === 'LOST') {
        const targetStage = await prisma.pipelineStage.findUnique({
          where: { key: data.status === 'WON' ? 'won' : 'lost' },
        });
        if (targetStage) updates.pipelineStage = { connect: { id: targetStage.id } };
        activities.push({
          type: data.status,
          message: data.status === 'WON' ? 'Marked Won' : 'Marked Lost',
        });
      } else {
        activities.push({
          type: 'STATUS_CHANGE',
          message: `Status changed from ${LEAD_STATUS_LABELS[lead.status]} to ${LEAD_STATUS_LABELS[data.status]}`,
        });
      }
    }

    if (nextStatus) {
      updates.status = nextStatus;
    }

    if (data.nextFollowUpAt !== undefined || data.nextFollowUpType !== undefined) {
      const followUpDate = data.nextFollowUpAt ? new Date(data.nextFollowUpAt) : null;
      updates.nextFollowUpAt = followUpDate;
      updates.nextFollowUpType = data.nextFollowUpType ?? null;
      if (followUpDate) {
        const typeLabel = data.nextFollowUpType ? FOLLOW_UP_TYPE_LABELS[data.nextFollowUpType] : 'Follow-up';
        activities.push({
          type: 'FOLLOW_UP_SCHEDULED',
          message: `${typeLabel} follow-up scheduled for ${followUpDate.toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}`,
        });
      }
    }

    if (data.recordContact) {
      updates.lastContactedAt = new Date();
      activities.push({
        type: 'CONTACT_RECORDED',
        message: `${FOLLOW_UP_TYPE_LABELS[data.recordContact]} contact recorded`,
      });
    }

    if (Object.keys(updates).length === 0 && activities.length === 0) {
      return jsonError('No changes to apply', 400);
    }

    const updatedLead = await prisma.$transaction(async (tx) => {
      const result = Object.keys(updates).length > 0
        ? await tx.lead.update({ where: { id }, data: updates })
        : lead;

      if (activities.length > 0) {
        await tx.leadActivity.createMany({
          data: activities.map((activity) => ({
            leadId: id,
            userId: session.sub,
            type: activity.type,
            message: activity.message,
          })),
        });
      }

      return result;
    });

    for (const activity of activities) {
      await emitLeadEvent({
        type:
          activity.type === 'WON'
            ? 'lead.won'
            : activity.type === 'LOST'
              ? 'lead.lost'
              : activity.type === 'STAGE_CHANGE'
                ? 'lead.stage_changed'
                : activity.type === 'STATUS_CHANGE'
                  ? 'lead.status_changed'
                  : activity.type === 'FOLLOW_UP_SCHEDULED'
                    ? 'lead.follow_up_scheduled'
                    : 'lead.contact_recorded',
        leadId: id,
        data: { message: activity.message, byUserId: session.sub },
      });
    }

    return jsonSuccess({ lead: { id: updatedLead.id } });
  } catch (err) {
    return jsonError('Unable to update lead right now.', 500, err);
  }
}
