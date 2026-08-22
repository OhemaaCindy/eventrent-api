import { ListingCard } from "@/components/browse/ListingCard"
import type { ListingCardData } from "@/types/listing"

export function ListingGrid({ listings }: { listings: ListingCardData[] }) {
  if (listings.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        No listings match these filters.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
