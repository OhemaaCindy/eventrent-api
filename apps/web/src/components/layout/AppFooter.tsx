const FOOTER_LINKS = ["Support", "Legal", "Privacy Policy", "Instagram", "LinkedIn"]

export function AppFooter() {
  return (
    <footer className="border-t border-border bg-muted">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-8 py-8 lg:flex-row lg:items-center lg:justify-between">
        <span className="font-heading text-lg font-semibold text-primary dark:text-white">
          EventRent
        </span>

        <nav className="flex flex-wrap gap-5">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {link}
            </a>
          ))}
        </nav>

        <span className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} EventRent Premium. All rights reserved.
        </span>
      </div>
    </footer>
  )
}
