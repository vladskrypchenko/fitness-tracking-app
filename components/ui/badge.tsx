import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "outline"

const base =
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 [&>svg]:pointer-events-none [&>svg]:size-3 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

const variants: Record<BadgeVariant, string> = {
  default: "border-transparent bg-primary text-primary-foreground",
  outline: "text-foreground",
}

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & { asChild?: boolean; variant?: BadgeVariant }) {
  const Comp = asChild ? Slot : "span"
  return (
    <Comp data-slot="badge" className={cn(base, variants[variant], className)} {...props} />
  )
}

export { Badge }
