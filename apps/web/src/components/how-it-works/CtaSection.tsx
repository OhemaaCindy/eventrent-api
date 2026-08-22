import { Link } from "react-router-dom"

import { buttonVariants } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section className="relative left-1/2 -mb-8 w-screen -translate-x-1/2 bg-[var(--rose-950)] py-16 text-center text-white dark:bg-[var(--rose-600)]">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 px-8">
        <h2 className="font-heading text-3xl font-semibold">Ready to plan your event?</h2>

        <Link to="/" className={buttonVariants({ size: "lg" })}>
          Browse Equipment
        </Link>

        <p className="text-sm text-white/70">
          Have equipment to rent out instead?{" "}
          <a href="#" className="underline hover:text-white">
            List your gear
          </a>
        </p>
      </div>
    </section>
  )
}
