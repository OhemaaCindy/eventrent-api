import { BadgeCheck, Gavel, Shield } from "lucide-react"

export function ProtectionSection() {
  return (
    <section className="w-full py-16">
      <div className="flex flex-col items-center gap-8 rounded-xl border border-success/30 bg-success/10 p-8 lg:p-10">
        <div className="flex flex-col items-center gap-3 text-center ">
          <div className="flex size-12 items-center justify-center rounded-full bg-success/15">
            <Shield className="size-5 text-success" />
          </div>
          <h2 className="font-heading text-2xl font-semibold">Peace of mind, built in</h2>
        </div>

        <div className="flex justify-evenly grid w-full grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-20 ">
          <div className="flex gap-3">
            <BadgeCheck className="size-5 shrink-0 text-success" />
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold">Security Deposits</h3>
              <p className="text-sm text-muted-foreground">
                Every booking automatically includes a refundable security deposit,<br/> providing a
                financial safety net and ensuring your items are treated with respect.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Gavel className="size-5 shrink-0 text-success" />
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold">Owner Protection</h3>
              <p className="text-sm text-muted-foreground">
                In the rare event an item is returned damaged, EventRent's dedicated <br/> dispute
                resolution process steps in to protect you and your investment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
