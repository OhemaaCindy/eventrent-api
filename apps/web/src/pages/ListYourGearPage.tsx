import { BenefitsSection } from "@/components/list-your-gear/BenefitsSection"
import { CtaSection } from "@/components/list-your-gear/CtaSection"
import { HeroSection } from "@/components/list-your-gear/HeroSection"
import { ProtectionSection } from "@/components/list-your-gear/ProtectionSection"
import { StepsSection } from "@/components/list-your-gear/StepsSection"

export function ListYourGearPage() {
  return (
    <div className="flex w-full flex-col">
      <HeroSection />
      <BenefitsSection />
      <StepsSection />
      <ProtectionSection />
      <CtaSection />
    </div>
  )
}
