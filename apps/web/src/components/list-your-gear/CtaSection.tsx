import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section className="relative left-1/2 -mb-8 w-screen -translate-x-1/2 bg-[var(--rose-950)] py-12 text-white dark:bg-[var(--rose-600)]">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-6 px-8 sm:flex-row">
        <div className="flex flex-col gap-1 text-center sm:text-left">
          <h2 className="font-heading text-2xl font-semibold">Ready to start earning?</h2>
          <p className="text-sm text-white/70">
            Join our community of curators and event professionals today.
          </p>
        </div>

        <a
          href="#"
          className={buttonVariants({ size: "lg", className: "w-fit shrink-0 gap-1.5" })}
        >
          Get Started
          <ArrowRight className="size-4" />
        </a>
      </div>
    </section>
  )
}
