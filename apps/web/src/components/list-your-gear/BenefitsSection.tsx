import { ShieldCheck, SlidersHorizontal, Sprout } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

interface Benefit {
  icon: LucideIcon
  title: string
  description: string
}

const BENEFITS: Benefit[] = [
  {
    icon: Sprout,
    title: "Earn from gear sitting in storage",
    description:
      "Monetize idle assets. Turn the high-quality equipment you already own into a reliable revenue stream.",
  },
  {
    icon: SlidersHorizontal,
    title: "You set your own price and availability",
    description:
      "Maintain total control. Decide exactly when your items are available and set rates that reflect their true value.",
  },
  {
    icon: ShieldCheck,
    title: "Get paid securely per booking",
    description:
      "Enjoy peace of mind with our secure payment system and the same dispute-resolution protection that covers every rental.",
  },
]

export function BenefitsSection() {
  return (
    <section className="w-full py-16">
      <div className="flex w-full flex-col gap-10">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="font-heading text-3xl font-semibold">Why list with EventRent?</h2>
          <p className="text-muted-foreground">
            We provide the platform, security, and audience so you can focus on maximizing your
            inventory's value.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <Card key={benefit.title}>
              <CardContent className="flex flex-col gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-accent">
                  <benefit.icon className="size-5 text-accent-foreground" />
                </div>
                <h3 className="font-heading text-base font-semibold">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
