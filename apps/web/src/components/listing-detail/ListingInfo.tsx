import { Droplets, Ruler, Timer, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import type { ListingSpec } from "@/types/listing"

const SPEC_ICONS: Record<string, LucideIcon> = {
  Footprint: Ruler,
  "Guest Capacity": Users,
  "Setup Time": Timer,
  Weatherproofing: Droplets,
}

export function ListingInfo({
  title,
  description,
  specs,
}: {
  title: string
  description: string
  specs: ListingSpec[]
}) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-4xl font-semibold">{title}</h1>
      <p className="max-w-[65ch] text-muted-foreground">{description}</p>

      <div className="mt-2 flex w-fit flex-wrap gap-x-8 gap-y-3 rounded-lg border border-border bg-muted/50 p-4">
        {specs.map((spec) => {
          const Icon = SPEC_ICONS[spec.label]
          return (
            <div key={spec.label} className="flex items-center gap-2 text-sm">
              {Icon && <Icon className="size-4 text-muted-foreground" />}
              {spec.value}
            </div>
          )
        })}
      </div>
    </div>
  )
}
