"use client"

import { CSSProperties, ReactNode } from "react"
import { HEARTH } from "@/lib/design/tokens"

type BtnSize = "sm" | "md" | "lg"

interface CTABtnProps {
  onClick?: () => void
  disabled?: boolean
  children: ReactNode
  full?: boolean
  size?: BtnSize
  variant?: "primary" | "ghost" | "dark"
  style?: CSSProperties
  type?: "button" | "submit"
}

const PADDING: Record<BtnSize, string> = {
  sm: "7px 16px",
  md: "10px 22px",
  lg: "13px 32px",
}

const FONTSIZE: Record<BtnSize, number> = {
  sm: 13,
  md: 14,
  lg: 15.5,
}

export function CTABtn({
  onClick, disabled, children, full, size = "md", variant = "primary", style, type = "button"
}: CTABtnProps) {
  const isPrimary = variant === "primary"
  const isDark    = variant === "dark"
  const isGhost   = variant === "ghost"

  const bg    = disabled ? "#EDE8E1" : isPrimary ? HEARTH : isDark ? "#1C1917" : "transparent"
  const color = disabled ? "#B8B0A8" : isGhost ? "#78716C" : "#FFFFFF"
  const border = isGhost ? "1px solid #E2D9CE" : "none"

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: PADDING[size],
        fontSize: FONTSIZE[size],
        fontWeight: 560,
        letterSpacing: "-0.01em",
        backgroundColor: bg,
        color,
        border,
        borderRadius: 7,
        cursor: disabled ? "default" : "pointer",
        width: full ? "100%" : undefined,
        transition: "opacity 0.15s, border-color 0.15s, color 0.15s",
        fontFamily: "inherit",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (disabled) return
        if (isGhost) {
          e.currentTarget.style.borderColor = HEARTH
          e.currentTarget.style.color = HEARTH
        } else {
          e.currentTarget.style.opacity = "0.88"
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1"
        if (isGhost) {
          e.currentTarget.style.borderColor = "#E2D9CE"
          e.currentTarget.style.color = "#78716C"
        }
      }}
    >
      {children}
    </button>
  )
}
