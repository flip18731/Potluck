import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { HEARTH, COLORS } from "@/lib/design/tokens"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "text-white hover:opacity-[0.88] focus-visible:ring-[#C07A38]",
        destructive: "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500",
        outline: "border bg-white hover:bg-[#FAF8F5] text-[#1C1917] focus-visible:ring-[#C07A38]",
        secondary: "bg-[#F0EBE3] text-[#1C1917] hover:bg-[#E8E3DC] focus-visible:ring-[#C07A38]",
        ghost: "hover:bg-[#F5F0EA] hover:text-[#1C1917] text-[#78716C]",
        link: "underline-offset-4 hover:underline text-[#C07A38]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const mergedStyle =
      variant === "default" || variant === undefined
        ? { backgroundColor: HEARTH, ...style }
        : variant === "outline"
          ? { borderColor: COLORS.cardBorder, ...style }
          : style
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        style={mergedStyle}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
