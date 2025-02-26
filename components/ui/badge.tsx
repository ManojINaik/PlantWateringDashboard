import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline:
          "border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900",
        success:
          "bg-green-100 text-green-800 border border-green-200 hover:bg-green-200",
        warning:
          "bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200",
        info:
          "bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200",
        error:
          "bg-red-100 text-red-800 border border-red-200 hover:bg-red-200",
        ghost:
          "bg-transparent hover:bg-gray-100 text-gray-700",
        ring:
          "border border-transparent ring-2 ring-primary/10 text-primary bg-background",
        "success-solid":
          "bg-green-600 text-white hover:bg-green-700",
        "warning-solid":
          "bg-amber-600 text-white hover:bg-amber-700",
        "info-solid":
          "bg-blue-600 text-white hover:bg-blue-700",
        "error-solid":
          "bg-red-600 text-white hover:bg-red-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants } 