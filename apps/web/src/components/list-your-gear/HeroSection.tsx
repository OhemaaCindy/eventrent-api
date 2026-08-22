import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="grid w-full grid-cols-1 items-center gap-10 py-12 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <h1 className="font-heading text-4xl font-semibold lg:text-5xl">
          Turn your event gear into earnings
        </h1>
        <p className="text-lg text-muted-foreground">
          Join EventRent's curated marketplace. Rent out your professional equipment, vintage
          decor, and specialized event items to trusted organizers.
        </p>

        <div className="relative inline-block w-fit">
          <span className="absolute inset-0 -z-10 rounded-lg bg-primary/50 blur-md animate-pulse" />
          <a href="#" className={buttonVariants({ size: "lg", className: "w-fit gap-1.5" })}>
            Get Started
            <ArrowRight className="size-4" />
          </a>
        </div>
      </div>

      <img
        src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&h=700&q=80"
        alt=""
        className="aspect-[4/3] w-full rounded-xl object-cover"
      />
    </section>
  )
}
