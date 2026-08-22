import type { FulfillmentType } from "@/types/listing"

export const FULFILLMENT_LABELS: Record<FulfillmentType, string> = {
  PICKUP: "Pickup Only",
  DELIVERY: "Delivery Available",
  BOTH: "Delivery & Setup",
}
