import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/useTheme"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="text-secondary-foreground hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  )
}
