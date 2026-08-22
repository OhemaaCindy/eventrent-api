export type FulfillmentType = "PICKUP" | "DELIVERY" | "BOTH"

export interface ListingCardData {
  id: string
  title: string
  location: string
  pricePerDay: number
  categoryName: string
  fulfillmentType: FulfillmentType
  isVerifiedOwner: boolean
  imageUrl: string
}

export interface PricingTier {
  minDays: number
  label: string
  discountPercent: number
  totalPrice: number
}

export interface ListingSpec {
  label: string
  value: string
}

export interface ListingOwner {
  name: string
  avatarUrl: string
  isVerified: boolean
  joinedYear: number
  rentalCount: number
}

export interface ListingDetail {
  id: string
  title: string
  description: string
  location: string
  pricePerDay: number
  depositAmount: number
  isPremium: boolean
  images: string[]
  pricingTiers: PricingTier[]
  specs: ListingSpec[]
  fulfillmentType: FulfillmentType
  setupIncluded: boolean
  owner: ListingOwner
}
