import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from '../src/lib/auth/password';
import { PIPELINE_STAGES } from '../src/lib/pipeline';

const adapter = new PrismaPg(
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/dsf_consult?schema=public'
);
const prisma = new PrismaClient({ adapter });

const LEAD_SOURCES = [
  { key: 'website_systems_audit', name: 'Website — Systems Audit Form' },
  { key: 'google_ads', name: 'Google Ads' },
  { key: 'facebook_lead_ads', name: 'Facebook Lead Ads' },
  { key: 'referral', name: 'Referral' },
];

async function main() {
  console.log('Seeding pipeline stages...');
  for (const stage of PIPELINE_STAGES) {
    await prisma.pipelineStage.upsert({
      where: { key: stage.key },
      update: { name: stage.name, order: stage.order },
      create: stage,
    });
  }

  console.log('Seeding lead sources...');
  for (const source of LEAD_SOURCES) {
    await prisma.leadSource.upsert({
      where: { key: source.key },
      update: { name: source.name },
      create: source,
    });
  }

  console.log('Seeding admin user...');
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@dsfconsult.com').toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const passwordHash = await hashPassword(adminPassword);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'DSF Admin',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log(`Admin user ready: ${adminEmail} (change SEED_ADMIN_PASSWORD before real use)`);

  const newLeadStage = await prisma.pipelineStage.findUniqueOrThrow({ where: { key: 'new_lead' } });
  const contactedStage = await prisma.pipelineStage.findUniqueOrThrow({ where: { key: 'contacted' } });
  const qualifiedStage = await prisma.pipelineStage.findUniqueOrThrow({ where: { key: 'qualified' } });
  const strategyCallStage = await prisma.pipelineStage.findUniqueOrThrow({ where: { key: 'strategy_call' } });
  const websiteSource = await prisma.leadSource.findUniqueOrThrow({ where: { key: 'website_systems_audit' } });

  console.log('Seeding sample leads...');
  const sampleLeads = [
    {
      firstName: 'Sarah',
      lastName: 'Mitchell',
      email: 'sarah.mitchell@example.com',
      phone: '+1 555 010 1234',
      journeyStage: 'GROWTH' as const,
      businessName: 'Bright Smile Dental',
      industry: 'Dental',
      monthlyLeadVolume: '31-100',
      currentLeadProcess: 'Someone calls manually',
      primaryChallenge: 'Responding quickly',
      desiredOutcome: 'Faster response',
      message: 'We miss a lot of after-hours enquiries.',
      tags: ['SCALE', 'EXISTING BUSINESS', 'NEEDS CRM'],
      status: 'NEW' as const,
      pipelineStageId: newLeadStage.id,
    },
    {
      firstName: 'James',
      lastName: 'Okafor',
      email: 'james.okafor@example.com',
      phone: '+1 555 010 5678',
      journeyStage: 'SYSTEMIZATION' as const,
      businessName: 'Okafor HVAC Services',
      industry: 'HVAC',
      monthlyLeadVolume: '11-30',
      currentLeadProcess: 'We use a CRM',
      primaryChallenge: 'Following up consistently',
      desiredOutcome: 'Better follow-up',
      message: '',
      tags: ['SYSTEMIZE', 'EXISTING BUSINESS', 'NEEDS FOLLOW-UP'],
      status: 'CONTACTED' as const,
      pipelineStageId: contactedStage.id,
      lastContactedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      nextFollowUpAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      nextFollowUpType: 'CALL' as const,
    },
    {
      firstName: 'Priya',
      lastName: 'Nair',
      email: 'priya.nair@example.com',
      phone: '+44 7700 900123',
      journeyStage: 'SCALING' as const,
      businessName: 'Nair & Associates Legal',
      industry: 'Legal',
      monthlyLeadVolume: '0-10',
      currentLeadProcess: "I'm not sure",
      primaryChallenge: 'Everything feels disconnected',
      desiredOutcome: 'Complete system rebuild',
      message: 'Looking for a proper system before year end.',
      tags: ['SCALE', 'EXISTING BUSINESS', 'NEEDS AUTOMATION'],
      status: 'QUALIFIED' as const,
      pipelineStageId: qualifiedStage.id,
      lastContactedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      nextFollowUpAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // overdue on purpose, for dashboard testing
      nextFollowUpType: 'EMAIL' as const,
    },
    {
      firstName: 'Marcus',
      lastName: 'Reyes',
      email: 'marcus.reyes@example.com',
      phone: '+1 555 010 9012',
      journeyStage: 'GROWTH' as const,
      businessName: 'Reyes Cleaning Co.',
      industry: 'Cleaning',
      monthlyLeadVolume: '101-300',
      currentLeadProcess: 'Someone texts manually',
      primaryChallenge: 'Booking appointments',
      desiredOutcome: 'More appointments',
      message: '',
      tags: ['SCALE', 'EXISTING BUSINESS', 'NEEDS CRM', 'HIGH LEAD VOLUME'],
      status: 'QUALIFIED' as const,
      pipelineStageId: strategyCallStage.id,
      lastContactedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      nextFollowUpAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
      nextFollowUpType: 'MEETING' as const,
      assignedToId: admin.id,
    },
    {
      firstName: 'Alicia',
      lastName: 'Turner',
      email: 'alicia.turner@example.com',
      phone: '+1 555 010 3344',
      journeyStage: 'ASPIRING_FOUNDER' as const,
      businessIdeaStatus: "I have skills but don't know what business to start",
      skillsAndExperience: '10 years as a nurse, interested in wellness coaching.',
      desiredSupport: ['Finding the right niche', 'Choosing a business idea', 'Creating my offer'],
      primaryGoal: 'Build a full-time business',
      startTimeline: 'Within 30 days',
      message: '',
      tags: ['START', 'ASPIRING FOUNDER'],
      status: 'NEW' as const,
      pipelineStageId: newLeadStage.id,
    },
    {
      firstName: 'Dev',
      lastName: 'Patel',
      email: 'dev.patel@example.com',
      phone: '+1 555 010 7788',
      journeyStage: 'EARLY_STAGE' as const,
      businessName: 'Patel Web Studio',
      industry: 'Professional Services',
      currentOffer: 'Freelance web design for small businesses',
      hasWebsite: 'Yes',
      hasCRM: 'No',
      hasCustomers: 'A Few',
      customerAcquisitionSources: 'Referrals and Instagram',
      primaryChallenge: 'Setting up systems',
      message: '',
      tags: ['START', 'EXISTING BUSINESS', 'NEEDS CRM'],
      status: 'NEW' as const,
      pipelineStageId: newLeadStage.id,
    },
    {
      firstName: 'Morgan',
      lastName: 'Ellis',
      email: 'morgan.ellis@example.com',
      phone: '+1 555 010 6611',
      journeyStage: 'UNSURE' as const,
      message: 'Not sure if I should start something new or fix what I already have.',
      primaryGoal: "I'm exploring my options",
      tags: [],
      status: 'NEW' as const,
      pipelineStageId: newLeadStage.id,
    },
  ];

  for (const leadData of sampleLeads) {
    const lead = await prisma.lead.upsert({
      where: { email: leadData.email },
      update: {},
      create: { ...leadData, source: 'seed', leadSourceId: websiteSource.id },
    });

    await prisma.leadActivity.upsert({
      where: { id: `seed-${lead.id}` },
      update: {},
      create: {
        id: `seed-${lead.id}`,
        leadId: lead.id,
        type: 'SUBMISSION',
        message: 'Lead submitted the DSF Growth Assessment.',
      },
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
