import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { COLORS, HEARTH } from "@/lib/design/tokens"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "text-[#5A4A3A]",
        secondary: "bg-[#F0EBE3] text-[#78716C]",
        destructive: "bg-red-50 text-red-800 border border-red-100",
        outline: "border text-[#78716C]",
        success: "text-[#4A5038]",
        warning: "text-[#6B5038]",
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

function Badge({ className, variant, style, ...props }: BadgeProps) {
  const mergedStyle =
    variant === "default" || variant === undefined
      ? { backgroundColor: COLORS.hearthLight, ...style }
      : variant === "outline"
        ? { borderColor: COLORS.cardBorder, ...style }
        : variant === "success"
          ? { backgroundColor: "#E8EDE4", ...style }
          : variant === "warning"
            ? { backgroundColor: COLORS.hearthLight, border: `1px solid ${HEARTH}33`, ...style }
            : style
  return <div className={cn(badgeVariants({ variant }), className)} style={mergedStyle} {...props} />
}

export { Badge, badgeVariants }
