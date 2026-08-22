import { CtaSection } from "@/components/how-it-works/CtaSection"
import { FaqSection } from "@/components/how-it-works/FaqSection"
import { HeroSection } from "@/components/how-it-works/HeroSection"
import { ProcessSteps } from "@/components/how-it-works/ProcessSteps"
import { TrustSection } from "@/components/how-it-works/TrustSection"

export function HowItWorksPage() {
  return (
    <div className="flex w-full flex-col">
      <HeroSection />
      <ProcessSteps />
      <TrustSection />
      <FaqSection />
      <CtaSection />
    </div>
  )
}
