import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { formatDate, formatDateTime, isOverdue } from '@/lib/format';
import { currentSituationSummary, qualificationFields } from '@/lib/lead-display';
import { StatusBadge } from '@/components/crm/StatusBadge';
import { JourneyStageBadge } from '@/components/crm/JourneyStageBadge';
import { LeadActionsPanel } from '@/components/crm/lead-detail/LeadActionsPanel';
import { NoteForm } from '@/components/crm/lead-detail/NoteForm';
import { FollowUpForm } from '@/components/crm/lead-detail/FollowUpForm';
import { AppointmentForm } from '@/components/crm/lead-detail/AppointmentForm';

export const dynamic = 'force-dynamic';

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: LeadDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id }, select: { firstName: true, lastName: true } });
  return { title: lead ? `${lead.firstName} ${lead.lastName} — DSF Consult CRM` : 'Lead — DSF Consult CRM' };
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;

  const [lead, stages] = await Promise.all([
    prisma.lead.findUnique({
      where: { id },
      include: {
        pipelineStage: true,
        leadSource: true,
        assignedTo: { select: { name: true } },
        notes: { orderBy: { createdAt: 'desc' }, include: { author: { select: { name: true } } } },
        activities: { orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } } },
        appointments: { orderBy: { scheduledFor: 'desc' } },
      },
    }),
    prisma.pipelineStage.findMany({ orderBy: { order: 'asc' } }),
  ]);

  if (!lead) {
    notFound();
  }

  const overdue = isOverdue(lead.nextFollowUpAt);
  const situation = currentSituationSummary(lead);
  const fields = qualificationFields(lead);
  const showMessageSeparately = lead.message && lead.journeyStage !== 'UNSURE';

  return (
    <div className="space-y-8">
      <div>
        <Link href="/crm/leads" className="text-sm text-slate-400 hover:text-white">
          ← Back to Leads
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {lead.firstName} {lead.lastName}
            </h1>
            <p className="mt-1 text-slate-400">{lead.businessName ?? 'No business yet'}</p>
            {lead.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {lead.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-slate-400">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <JourneyStageBadge stage={lead.journeyStage} />
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
              {lead.pipelineStage?.name ?? 'No stage'}
            </span>
            <StatusBadge status={lead.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Contact Information</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-500">Email</dt>
                <dd className="mt-1 text-white">
                  <a href={`mailto:${lead.email}`} className="hover:text-sky-300">
                    {lead.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Phone</dt>
                <dd className="mt-1 text-white">
                  <a href={`tel:${lead.phone}`} className="hover:text-sky-300">
                    {lead.phone}
                  </a>
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Business Journey</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-500">Journey Stage</dt>
                <dd className="mt-1">
                  <JourneyStageBadge stage={lead.journeyStage} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Primary Goal</dt>
                <dd className="mt-1 text-white">{lead.primaryGoal ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Current Situation</dt>
                <dd className="mt-1 text-white">{situation ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Start Timeline</dt>
                <dd className="mt-1 text-white">{lead.startTimeline ?? '—'}</dd>
              </div>
              {lead.desiredSupport.length > 0 && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-slate-500">Desired Support</dt>
                  <dd className="mt-1.5 flex flex-wrap gap-1.5">
                    {lead.desiredSupport.map((item) => (
                      <span key={item} className="rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-1 text-xs text-sky-200">
                        {item}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {(fields.length > 0 || showMessageSeparately) && (
            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Qualification Answers</h2>
              <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {fields.map((field) => (
                  <div key={field.label}>
                    <dt className="text-xs text-slate-500">{field.label}</dt>
                    <dd className="mt-1 text-white">{field.value}</dd>
                  </div>
                ))}
                {showMessageSeparately && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-slate-500">Message</dt>
                    <dd className="mt-1 whitespace-pre-wrap text-white">{lead.message}</dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Lead Source</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-500">Source</dt>
                <dd className="mt-1 text-white">{lead.leadSource?.name ?? lead.source ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Landing Page</dt>
                <dd className="mt-1 truncate text-white">{lead.landingPage ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">UTM Source / Medium / Campaign</dt>
                <dd className="mt-1 text-white">
                  {[lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(' / ') || '—'}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Notes</h2>
            <div className="mt-4 space-y-4">
              <NoteForm leadId={lead.id} />
              <ul className="space-y-3 border-t border-white/10 pt-4">
                {lead.notes.length === 0 && <li className="text-sm text-slate-500">No notes yet.</li>}
                {lead.notes.map((note) => (
                  <li key={note.id} className="rounded-lg bg-white/[0.03] p-3">
                    <p className="whitespace-pre-wrap text-sm text-slate-100">{note.content}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {note.author.name} · {formatDateTime(note.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Activity Timeline</h2>
            <ul className="mt-4 space-y-3 border-l border-white/10 pl-4">
              {lead.activities.length === 0 && <li className="text-sm text-slate-500">No activity yet.</li>}
              {lead.activities.map((activity) => (
                <li key={activity.id} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-sky-400" />
                  <p className="text-sm text-slate-100">{activity.message}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {activity.user?.name ?? 'System'} · {formatDateTime(activity.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          <LeadActionsPanel
            leadId={lead.id}
            currentStageKey={lead.pipelineStage?.key ?? null}
            currentStatus={lead.status}
            stages={stages}
          />

          <section className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Follow-Up</h2>
            <dl className="text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Last Contacted</dt>
                <dd className="text-white">{lead.lastContactedAt ? formatDateTime(lead.lastContactedAt) : '—'}</dd>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <dt className="text-slate-500">Next Follow-Up</dt>
                <dd className={overdue ? 'font-medium text-rose-300' : 'text-white'}>
                  {lead.nextFollowUpAt ? formatDateTime(lead.nextFollowUpAt) : '—'}
                  {overdue && ' (overdue)'}
                </dd>
              </div>
            </dl>
            <FollowUpForm leadId={lead.id} />
          </section>

          <section className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Appointments</h2>
            <AppointmentForm leadId={lead.id} />
            <ul className="space-y-2 border-t border-white/10 pt-4">
              {lead.appointments.length === 0 && <li className="text-sm text-slate-500">No appointments yet.</li>}
              {lead.appointments.map((appointment) => (
                <li key={appointment.id} className="rounded-lg bg-white/[0.03] p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white">{formatDate(appointment.scheduledFor)}</span>
                    <span className="text-xs text-slate-400">{appointment.status}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{appointment.type}</div>
                  {appointment.notes && <div className="mt-1 text-xs text-slate-500">{appointment.notes}</div>}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
