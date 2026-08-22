import { UserRound } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/layout/ThemeToggle"

const NAV_LINKS = [
  { label: "Browse", to: "/" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "List Your Gear", to: "/list-your-gear" },
]

export function AppHeader() {
  const location = useLocation()

  return (
    <header className="bg-muted text-foreground border-b border-border">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-8 py-4">
        <Link to="/" className="font-heading text-2xl font-semibold text-primary dark:text-white">
          EventRent
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = link.to !== null && location.pathname === link.to
            const className = isActive
              ? "border-b-2 border-primary pb-1 text-sm font-medium"
              : "text-sm font-medium text-muted-foreground hover:text-foreground"

            return link.to ? (
              <Link key={link.label} to={link.to} className={className}>
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href="#" className={className}>
                {link.label}
              </a>
            )
          })}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="icon">
            <UserRound />
          </Button>
        </div>
      </div>
    </header>
  )
}
