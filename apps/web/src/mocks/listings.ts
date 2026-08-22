import type { ListingCardData } from "@/types/listing"

// Placeholder data for the UI-only pass — swap for a GET /listings
// call once the browse page wires up to the real API. imageUrl points
// at free-license Unsplash photos chosen to match each listing's
// theme, until real Cloudinary URLs are available.
export const mockListings: ListingCardData[] = [
  {
    id: "1",
    title: "Rustic Farmhouse Table",
    location: "Downtown Austin",
    pricePerDay: 150,
    categoryName: "Tables",
    fulfillmentType: "DELIVERY",
    isVerifiedOwner: true,
    imageUrl:
      "https://images.unsplash.com/photo-1636309457923-54beab9d9bb5?auto=format&fit=crop&w=640&h=480&q=80",
  },
  {
    id: "2",
    title: "Cross-back Chairs (Set of 10)",
    location: "Downtown Austin",
    pricePerDay: 80,
    categoryName: "Chairs",
    fulfillmentType: "PICKUP",
    isVerifiedOwner: true,
    imageUrl:
      "https://images.unsplash.com/photo-1696271026800-0959e9cbf38c?auto=format&fit=crop&w=640&h=480&q=80",
  },
  {
    id: "3",
    title: "Sailcloth Tent (40x60)",
    location: "Downtown Austin",
    pricePerDay: 850,
    categoryName: "Tents",
    fulfillmentType: "BOTH",
    isVerifiedOwner: false,
    imageUrl:
      "https://images.unsplash.com/photo-1679984740405-6e15c2df8680?auto=format&fit=crop&w=640&h=480&q=80",
  },
  {
    id: "4",
    title: "Brass Candelabras (Set of 5)",
    location: "Downtown Austin",
    pricePerDay: 45,
    categoryName: "Lighting",
    fulfillmentType: "DELIVERY",
    isVerifiedOwner: true,
    imageUrl:
      "https://images.unsplash.com/photo-1653821355736-0c2598d0a63e?auto=format&fit=crop&w=640&h=480&q=80",
  },
  {
    id: "5",
    title: "Bistro Light Strands (100ft)",
    location: "Downtown Austin",
    pricePerDay: 30,
    categoryName: "Lighting",
    fulfillmentType: "DELIVERY",
    isVerifiedOwner: false,
    imageUrl:
      "https://images.unsplash.com/photo-1513538416877-f11f5fb85d83?auto=format&fit=crop&w=640&h=480&q=80",
  },
  {
    id: "6",
    title: "Acrylic Ghost Chairs (Set of 8)",
    location: "Downtown Austin",
    pricePerDay: 120,
    categoryName: "Chairs",
    fulfillmentType: "DELIVERY",
    isVerifiedOwner: true,
    imageUrl:
      "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=640&h=480&q=80",
  },
]
