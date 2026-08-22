import { BadgeCheck, Search, Truck, Zap } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

interface Step {
  icon: LucideIcon
  title: string
  description: string
}

const STEPS: Step[] = [
  {
    icon: Search,
    title: "1. Browse & Filter",
    description: "Find equipment by category, date, and location instantly.",
  },
  {
    icon: Zap,
    title: "2. Book Instantly",
    description: "Pay rental fee + refundable security deposit. Instant confirmation, no wait.",
  },
  {
    icon: Truck,
    title: "3. Pickup or Delivery",
    description: "Choose whichever convenient option the listing offers.",
  },
  {
    icon: BadgeCheck,
    title: "4. Return & Refund",
    description: "Automatic refund after owner confirms condition, or within 48-72 hours.",
  },
]

export function ProcessSteps() {
  return (
    <section className="bg-muted py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-8">
        <h2 className="text-center font-heading text-3xl font-semibold">
          The Rental Process
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <Card key={step.title}>
              <CardContent className="flex flex-col items-center gap-3 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-accent">
                  <step.icon className="size-5 text-accent-foreground" />
                </div>
                <h3 className="font-heading text-base font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
