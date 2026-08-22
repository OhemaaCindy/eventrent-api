import { BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

const VISIBLE_THUMBNAILS = 4

export function ListingGallery({
  images,
  isPremium,
}: {
  images: string[]
  isPremium: boolean
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const hero = images[selectedIndex]
  const others = images
    .map((image, index) => ({ image, index }))
    .filter(({ index }) => index !== selectedIndex)
  const thumbnails = others.slice(0, VISIBLE_THUMBNAILS)
  const remainingCount = others.length - thumbnails.length

  const showPrev = () =>
    setSelectedIndex((current) => (current - 1 + images.length) % images.length)
  const showNext = () => setSelectedIndex((current) => (current + 1) % images.length)

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-secondary/10">
        <img src={hero} alt="" className="h-full w-full object-cover" />
        {isPremium && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-accent/90 px-2.5 py-1 text-xs font-medium text-accent-foreground">
            <BadgeCheck className="size-3.5" />
            Premium
          </div>
        )}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrev}
              aria-label="Previous photo"
              className="absolute top-1/2 left-3 -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="Next photo"
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {thumbnails.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {thumbnails.map(({ image, index }, position) => {
            const isLast = position === thumbnails.length - 1
            return (
              <button
                key={image}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className="relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-secondary/10 outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <img src={image} alt="" className="h-full w-full object-cover" />
                {isLast && remainingCount > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-medium text-white">
                    +{remainingCount} More
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
