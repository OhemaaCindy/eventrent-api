import { Calendar, Camera, Truck, Wallet } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Step {
  number: number
  icon: LucideIcon
  title: string
  description: string
}

const STEPS: Step[] = [
  {
    number: 1,
    icon: Camera,
    title: "List your item",
    description: "Upload photos and set your terms.",
  },
  {
    number: 2,
    icon: Calendar,
    title: "Get booked",
    description: "Receive and approve rental requests.",
  },
  {
    number: 3,
    icon: Truck,
    title: "Hand off",
    description: "Coordinate pickup or delivery.",
  },
  {
    number: 4,
    icon: Wallet,
    title: "Get paid",
    description: "Funds released after safe return.",
  },
]

export function StepsSection() {
  return (
    <section className="w-full py-16">
      <div className="flex w-full flex-col gap-10">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="font-heading text-3xl font-semibold">How It Works</h2>
          <p className="text-muted-foreground">
            Four simple steps to start monetizing your inventory.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.number} className="flex flex-col items-center gap-3">
              <div className="relative flex size-14 items-center justify-center rounded-full bg-accent">
                <step.icon className="size-6 text-accent-foreground" />
                <span className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {step.number}
                </span>
              </div>
              <h3 className="font-heading text-base font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
