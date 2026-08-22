import type { ListingCardData } from "@/types/listing"

export interface BrowseFiltersState {
  categoryName: string | null
  delivery: boolean
  pickup: boolean
  maxPrice: number
}

export const DEFAULT_FILTERS: BrowseFiltersState = {
  categoryName: null,
  delivery: false,
  pickup: false,
  maxPrice: 1000,
}

export function filterListings(
  listings: ListingCardData[],
  filters: BrowseFiltersState
): ListingCardData[] {
  const noFulfillmentFilter = !filters.delivery && !filters.pickup

  return listings.filter((listing) => {
    if (filters.categoryName && listing.categoryName !== filters.categoryName) {
      return false
    }

    if (!noFulfillmentFilter) {
      const matchesDelivery =
        filters.delivery &&
        (listing.fulfillmentType === "DELIVERY" || listing.fulfillmentType === "BOTH")
      const matchesPickup =
        filters.pickup &&
        (listing.fulfillmentType === "PICKUP" || listing.fulfillmentType === "BOTH")
      if (!matchesDelivery && !matchesPickup) return false
    }

    if (listing.pricePerDay > filters.maxPrice) return false

    return true
  })
}
