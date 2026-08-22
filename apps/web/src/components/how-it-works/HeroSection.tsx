export function HeroSection() {
  return (
    <section className="flex flex-col items-center gap-8 py-12 text-center">
      <div className="flex flex-col gap-3">
        <h1 className="font-heading text-5xl font-semibold">How EventRent Works</h1>
        <p className="text-lg text-muted-foreground">
          Book instantly, no waiting on approval — and your deposit is always protected.
        </p>
      </div>

      <img
        src="https://images.unsplash.com/photo-1727931301188-55b23fa9672e?auto=format&fit=crop&w=1400&h=700&q=80"
        alt=""
        className="aspect-[3/1] w-full rounded-xl object-cover"
      />
    </section>
  )
}
