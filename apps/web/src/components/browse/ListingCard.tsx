import { BadgeCheck, MapPin } from "lucide-react"
import { Link } from "react-router-dom"

import { Card, CardContent } from "@/components/ui/card"
import { FULFILLMENT_LABELS } from "@/lib/listing-display"
import { cn } from "@/lib/utils"
import type { ListingCardData } from "@/types/listing"

export function ListingCard({ listing }: { listing: ListingCardData }) {
  return (
    <Link to={`/listings/${listing.id}`} className="block">
      <Card className="overflow-hidden [--card-spacing:0px] transition-shadow hover:shadow-md">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-secondary/10">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          {listing.isVerifiedOwner && (
            <div
              className={cn(
                "absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-accent/90",
                "px-2.5 py-1 text-xs font-medium text-accent-foreground"
              )}
            >
              <BadgeCheck className="size-3.5" />
              Verified Owner
            </div>
          )}
        </div>

        <CardContent className="flex flex-col gap-2 px-4 pt-3 pb-4">
          <h3 className="font-heading text-lg leading-tight font-semibold">
            {listing.title}
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
              {FULFILLMENT_LABELS[listing.fulfillmentType]}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              {listing.location}
            </span>
          </div>

          <div className="mt-1">
            <span className="font-heading text-xl font-semibold text-primary">
              ${listing.pricePerDay}
            </span>
            <span className="text-sm text-muted-foreground"> /day</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
