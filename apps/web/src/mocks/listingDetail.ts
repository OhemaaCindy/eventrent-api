import type { ListingDetail } from "@/types/listing"

// Placeholder data for the UI-only pass — every browse card currently
// links here regardless of id, since only one detail record exists so
// far. Swap for a GET /listings/:id call once this page wires up to
// the real API.
export const mockListingDetail: ListingDetail = {
  id: "demo",
  title: "Grand Safari Pavilion Tent",
  description:
    "Elevate your next gathering with our flagship Grand Safari Pavilion. Perfect for elegant outdoor weddings, premium corporate retreats, or sophisticated garden parties. Crafted from high-grade, weather-resistant canvas with solid timber framing, it offers a perfect blend of rugged durability and refined aesthetics.",
  location: "Downtown Austin",
  pricePerDay: 250,
  depositAmount: 500,
  isPremium: true,
  images: [
    "https://images.unsplash.com/photo-1679984740405-6e15c2df8680?auto=format&fit=crop&w=1400&h=900&q=80",
    "https://images.unsplash.com/photo-1633005625748-e42a95afc858?auto=format&fit=crop&w=400&h=400&q=80",
    "https://images.unsplash.com/photo-1758810742974-b92459867642?auto=format&fit=crop&w=400&h=400&q=80",
    "https://images.unsplash.com/photo-1678517098247-3d9b6608ee9f?auto=format&fit=crop&w=400&h=400&q=80",
    "https://images.unsplash.com/photo-1653518882586-588362773209?auto=format&fit=crop&w=400&h=400&q=80",
    // The next 5 reuse the photos above (a real gallery would have
    // distinct shots) — they exist so the "+N More" overlay on the
    // last visible thumbnail reflects a real, non-zero count.
    "https://images.unsplash.com/photo-1653518882586-588362773209?auto=format&fit=crop&w=400&h=400&q=80&flip=h",
    "https://images.unsplash.com/photo-1679984740405-6e15c2df8680?auto=format&fit=crop&w=400&h=400&q=80&sat=-20",
    "https://images.unsplash.com/photo-1633005625748-e42a95afc858?auto=format&fit=crop&w=400&h=400&q=80&sat=-20",
    "https://images.unsplash.com/photo-1758810742974-b92459867642?auto=format&fit=crop&w=400&h=400&q=80&sat=-20",
    "https://images.unsplash.com/photo-1678517098247-3d9b6608ee9f?auto=format&fit=crop&w=400&h=400&q=80&sat=-20",
  ],
  pricingTiers: [
    { minDays: 1, label: "1 Day", discountPercent: 0, totalPrice: 250 },
    { minDays: 3, label: "3 Days", discountPercent: 15, totalPrice: 637 },
    { minDays: 7, label: "1 Week", discountPercent: 30, totalPrice: 1225 },
  ],
  specs: [
    { label: "Footprint", value: "20' x 40'" },
    { label: "Guest Capacity", value: "Up to 80 Guests" },
    { label: "Setup Time", value: "4hr Setup Time" },
    { label: "Weatherproofing", value: "100% Weatherproof" },
  ],
  fulfillmentType: "DELIVERY",
  setupIncluded: true,
  owner: {
    name: "Eleanor Vance",
    avatarUrl:
      "https://images.unsplash.com/photo-1604904612715-47bf9d9bc670?auto=format&fit=crop&w=96&h=96&q=80",
    isVerified: true,
    joinedYear: 2021,
    rentalCount: 48,
  },
}
