import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Primary
        default:
          "bg-primary text-primary-foreground hover:bg-[var(--rose-700)] dark:hover:bg-[var(--rose-300)] active:not-aria-[haspopup]:bg-[var(--rose-800)] dark:active:not-aria-[haspopup]:bg-[var(--rose-200)] disabled:bg-[var(--rose-300)] disabled:text-white/80 dark:disabled:bg-[var(--rose-800)] dark:disabled:text-white/50",
        // Tertiary
        outline:
          "border-[var(--rose-600)] bg-background text-[var(--rose-600)] dark:border-[var(--rose-400)] dark:text-[var(--rose-400)] hover:bg-[var(--rose-50)] dark:hover:bg-[var(--rose-950)] active:not-aria-[haspopup]:border-[var(--rose-700)] active:not-aria-[haspopup]:bg-[var(--rose-100)] active:not-aria-[haspopup]:text-[var(--rose-700)] dark:active:not-aria-[haspopup]:border-[var(--rose-300)] dark:active:not-aria-[haspopup]:bg-[var(--rose-900)] dark:active:not-aria-[haspopup]:text-[var(--rose-300)] disabled:border-[var(--rose-200)] disabled:bg-background disabled:text-[var(--rose-200)] dark:disabled:border-white/15 dark:disabled:text-white/25",
        // Secondary
        secondary:
          "bg-[var(--rose-100)] text-[var(--rose-800)] dark:bg-[var(--rose-950)] dark:text-[var(--rose-300)] hover:bg-[var(--rose-200)] dark:hover:bg-[var(--rose-900)] active:not-aria-[haspopup]:bg-[var(--rose-400)] active:not-aria-[haspopup]:text-white dark:active:not-aria-[haspopup]:bg-[var(--rose-600)] disabled:bg-[var(--rose-100)] disabled:text-[var(--rose-300)] dark:disabled:bg-[var(--rose-950)] dark:disabled:text-white/25",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 disabled:opacity-50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40 disabled:opacity-50",
        link: "text-primary underline-offset-4 hover:underline disabled:opacity-50",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
