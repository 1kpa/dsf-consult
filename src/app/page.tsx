import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/sections/Hero';
import { TwoPathwaysSection } from '@/components/sections/TwoPathways';
import { StartingFromZeroSection } from '@/components/sections/StartingFromZero';
import { ProblemSection } from '@/components/sections/Problem';
import { StartSystemizeScaleSection } from '@/components/sections/StartSystemizeScale';
import { JourneyEntryPointsSection } from '@/components/sections/JourneyEntryPoints';
import { ThreeDJourney } from '@/components/sections/ThreeDJourney';
import { SystemsOverviewSection } from '@/components/sections/SystemsOverview';
import { HowItWorksSection } from '@/components/sections/HowItWorks';
import { IndustriesSection } from '@/components/sections/Industries';
import { SystemsAuditCTASection } from '@/components/sections/SystemsAuditCTA';
import { Footer } from '@/components/sections/Footer';

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="w-full">
        <HeroSection />
        <TwoPathwaysSection />
        <StartingFromZeroSection />
        <ProblemSection />
        <StartSystemizeScaleSection />
        <JourneyEntryPointsSection />
        <ThreeDJourney />
        <SystemsOverviewSection />
        <HowItWorksSection />
        <IndustriesSection />
        <SystemsAuditCTASection />
        <Footer />
      </main>
    </>
  );
}
