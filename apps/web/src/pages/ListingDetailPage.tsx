import { BookingCard } from "@/components/listing-detail/BookingCard"
import { ListingGallery } from "@/components/listing-detail/ListingGallery"
import { ListingInfo } from "@/components/listing-detail/ListingInfo"
import { OwnerCard } from "@/components/listing-detail/OwnerCard"
import { mockListingDetail } from "@/mocks/listingDetail"

export function ListingDetailPage() {
  const listing = mockListingDetail

  return (
    <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
      <div className="flex flex-col gap-6">
        <ListingGallery images={listing.images} isPremium={listing.isPremium} />
        <ListingInfo
          title={listing.title}
          description={listing.description}
          specs={listing.specs}
        />
      </div>

      <div className="flex flex-col gap-4 self-start lg:sticky lg:top-8">
        <BookingCard
          pricePerDay={listing.pricePerDay}
          depositAmount={listing.depositAmount}
          pricingTiers={listing.pricingTiers}
          fulfillmentType={listing.fulfillmentType}
          setupIncluded={listing.setupIncluded}
          location={listing.location}
        />
        <OwnerCard owner={listing.owner} />
      </div>
    </div>
  )
}
