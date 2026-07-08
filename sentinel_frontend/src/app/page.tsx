import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProblemSection from "@/components/landing/ProblemSection";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import ArchitectureSection from "@/components/landing/ArchitectureSection";
import WhyIdentitySecurity from "@/components/landing/WhyIdentitySecurity";
import WorkflowSection from "@/components/landing/WorkflowSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import Pricing from "@/components/landing/Pricing";
import FaqSection from "@/components/landing/FaqSection";
import CtaBanner from "@/components/landing/CtaBanner";
import Footer from "@/components/landing/Footer";
import BackgroundEffects from "@/components/landing/BackgroundEffects";

export default function LandingPage() {
  return (
    <div className="landing-page-wrapper relative overflow-hidden font-sans bg-slate-50 min-h-screen flex flex-col">
      <BackgroundEffects />
      <Navbar />
      <main>
        {/* Section 2 & 3 */}
        <Hero />
        {/* Section 4 */}
        <ProblemSection />
        {/* Section 5 */}
        <HowItWorks />
        {/* Section 6 */}
        <Features />
        {/* Section 7 */}
        <ArchitectureSection />
        {/* Section 8 */}
        <WhyIdentitySecurity />
        {/* Section 9 & 10 */}
        <WorkflowSection />
        {/* Section 11 */}
        <BenefitsSection />
        {/* Section 12 */}
        <Pricing />
        {/* Section 13 */}
        <FaqSection />
        {/* Section 14 */}
        <CtaBanner />
      </main>
      {/* Section 15 */}
      <Footer />
    </div>
  );
}
