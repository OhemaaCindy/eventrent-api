import { MapPin, Truck, Wrench } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { FULFILLMENT_LABELS } from "@/lib/listing-display"
import type { FulfillmentType, PricingTier } from "@/types/listing"

interface BookingCardProps {
  pricePerDay: number
  depositAmount: number
  pricingTiers: PricingTier[]
  fulfillmentType: FulfillmentType
  setupIncluded: boolean
  location: string
}

export function BookingCard({
  pricePerDay,
  depositAmount,
  pricingTiers,
  fulfillmentType,
  setupIncluded,
  location,
}: BookingCardProps) {
  return (
    <Card className="gap-5">
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div>
            <span className="font-heading text-3xl font-semibold">${pricePerDay}</span>
            <span className="text-muted-foreground"> /day</span>
          </div>
          <span className="inline-flex w-fit items-center rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
            ${depositAmount} Refundable Deposit
          </span>
        </div>

        <Separator />

        <div className="rounded-lg bg-muted p-4">
          <h3 className="mb-3 text-sm font-semibold">Multi-Day Pricing</h3>
          <div className="flex flex-col gap-2">
            {pricingTiers.map((tier) => (
              <div key={tier.label} className="flex items-center justify-between text-sm">
                <span>
                  {tier.label}
                  {tier.discountPercent > 0 && (
                    <span className="text-success"> ({tier.discountPercent}% off)</span>
                  )}
                </span>
                <span className={tier.discountPercent > 0 ? "font-semibold text-success" : ""}>
                  ${tier.totalPrice}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="start-date" className="text-sm font-medium">
              Start Date
            </Label>
            <Input id="start-date" type="date" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="end-date" className="text-sm font-medium">
              End Date
            </Label>
            <Input id="end-date" type="date" />
          </div>
        </div>

        <Button size="lg" className="w-full">
          Book Now
        </Button>

        <Separator />

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
            <Truck className="size-3.5" />
            {FULFILLMENT_LABELS[fulfillmentType]}
          </span>
          {setupIncluded && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
              <Wrench className="size-3.5" />
              Setup Included
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-4" />
          {location}
        </span>
      </CardContent>
    </Card>
  )
}
