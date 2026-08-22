import type { CategoryOption } from "@/types/category"

// Placeholder data for the UI-only pass — swap for a GET /categories
// call once the browse page wires up to the real API.
export const mockCategories: CategoryOption[] = [
  { id: "tables", name: "Tables" },
  { id: "chairs", name: "Chairs" },
  { id: "tents", name: "Tents" },
  { id: "lighting", name: "Lighting" },
]
