import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import type { BrowseFiltersState } from "@/lib/filter-listings"
import type { CategoryOption } from "@/types/category"

const ALL_CATEGORIES = "all"

interface BrowseFiltersProps {
  categories: CategoryOption[]
  filters: BrowseFiltersState
  onChange: (filters: BrowseFiltersState) => void
}

export function BrowseFilters({ categories, filters, onChange }: BrowseFiltersProps) {
  return (
    <aside className="flex w-full flex-col gap-8 md:w-64">
      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold">Categories</h2>
        <RadioGroup
          value={filters.categoryName ?? ALL_CATEGORIES}
          onValueChange={(value) =>
            onChange({
              ...filters,
              categoryName: value === ALL_CATEGORIES ? null : (value as string),
            })
          }
        >
          <label className="flex items-center gap-2.5 text-sm">
            <RadioGroupItem value={ALL_CATEGORIES} />
            All categories
          </label>
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-2.5 text-sm">
              <RadioGroupItem value={category.name} />
              {category.name}
            </label>
          ))}
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold">Fulfillment</h2>
        <label className="flex items-center gap-2.5 text-sm">
          <Checkbox
            checked={filters.delivery}
            onCheckedChange={(checked) =>
              onChange({ ...filters, delivery: checked === true })
            }
          />
          Delivery
        </label>
        <label className="flex items-center gap-2.5 text-sm">
          <Checkbox
            checked={filters.pickup}
            onCheckedChange={(checked) =>
              onChange({ ...filters, pickup: checked === true })
            }
          />
          Pickup
        </label>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold">Price Range</h2>
        <Slider
          value={[filters.maxPrice]}
          min={0}
          max={1000}
          step={10}
          onValueChange={(value) =>
            onChange({ ...filters, maxPrice: Array.isArray(value) ? value[0] : value })
          }
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>$0</span>
          <span>{filters.maxPrice >= 1000 ? "$1000+" : `$${filters.maxPrice}`}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Label htmlFor="browse-date" className="font-heading text-lg font-semibold">
          Dates
        </Label>
        <Input id="browse-date" type="date" />
      </div>
    </aside>
  )
}
