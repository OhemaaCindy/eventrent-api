import { Shield, ShieldCheck } from "lucide-react"

export function TrustSection() {
  return (
    <section className="py-16">
      <div className="grid grid-cols-1 items-center gap-8 rounded-xl border border-success/30 bg-success/10 p-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold tracking-wide text-success uppercase">
            <Shield className="size-3.5" />
            Trust & Protection
          </span>

          <h2 className="font-heading text-3xl font-semibold">Your Deposit is Protected</h2>

          <p className="text-muted-foreground">
            We believe in fair play. Security deposits are held safely by EventRent and are
            fully refundable.
          </p>
          <p className="text-muted-foreground">
            Owners have a limited window to flag any issues after a return. If a disagreement
            occurs, EventRent's dedicated dispute resolution process steps in to review evidence
            fairly, ensuring both parties are protected.
          </p>
        </div>

        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1742836531271-98fd8151d257?auto=format&fit=crop&w=800&h=600&q=80"
            alt=""
            className="aspect-[3/2] w-full rounded-xl object-cover"
          />
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-medium text-success-foreground">
            <ShieldCheck className="size-3.5" />
            Secure Rental
          </div>
        </div>
      </div>
    </section>
  )
}
