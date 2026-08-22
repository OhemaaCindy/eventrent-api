import { BadgeCheck } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import type { ListingOwner } from "@/types/listing"

export function OwnerCard({ owner }: { owner: ListingOwner }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={owner.avatarUrl}
            alt={owner.name}
            className="size-11 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="inline-flex items-center gap-1 text-sm font-semibold">
              {owner.name}
              {owner.isVerified && (
                <BadgeCheck className="size-3.5 text-primary" />
              )}
            </span>
            <span className="text-xs text-muted-foreground">
              Joined {owner.joinedYear} • {owner.rentalCount} Rentals
            </span>
          </div>
        </div>

        <button className="text-sm font-medium text-primary hover:underline">
          Message
        </button>
      </CardContent>
    </Card>
  )
}
