import LandingNavbar from '@/components/landing/LandingNavbar';
import HeroSection from '@/components/landing/HeroSection';
import ProblemSection from '@/components/landing/ProblemSection';
import PipelineSection from '@/components/landing/PipelineSection';
import AgentsSection from '@/components/landing/AgentsSection';
import MissionSection from '@/components/landing/MissionSection';

export default function Landing() {
  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <HeroSection />
      <ProblemSection />
      <PipelineSection />
      <AgentsSection />
      <MissionSection />
    </div>
  );
}
