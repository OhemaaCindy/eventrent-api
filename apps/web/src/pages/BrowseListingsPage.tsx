import { useState } from "react"

import { BrowseFilters } from "@/components/browse/BrowseFilters"
import { ListingGrid } from "@/components/browse/ListingGrid"
import { DEFAULT_FILTERS, filterListings } from "@/lib/filter-listings"
import { mockCategories } from "@/mocks/categories"
import { mockListings } from "@/mocks/listings"

export function BrowseListingsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const visibleListings = filterListings(mockListings, filters)

  return (
    <>
      <BrowseFilters
        categories={mockCategories}
        filters={filters}
        onChange={setFilters}
      />
      <div className="flex-1">
        <ListingGrid listings={visibleListings} />
      </div>
    </>
  )
}
