"use client"

import { useState } from "react"
import { formatIdentity } from "@/lib/initia/username"
import { INITIA_TESTNET } from "@/lib/initia/chain"
import { cn } from "@/lib/utils"

interface UsernameBadgeProps {
  address: string
  username?: string | null
  size?: "sm" | "md" | "lg"
  className?: string
  showAddress?: boolean
}

export function UsernameBadge({ address, username, size = "md", className, showAddress }: UsernameBadgeProps) {
  const [expanded, setExpanded] = useState(false)
  const display = formatIdentity(address, username ?? null)
  const avatarLetter = (username || address)[0]?.toUpperCase() ?? "?"

  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  }

  const textClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold flex-shrink-0",
        sizeClasses[size]
      )}>
        {avatarLetter}
      </div>
      <div className="flex flex-col min-w-0">
        <span className={cn("font-medium truncate", textClasses[size])}>
          {display}
        </span>
        {(showAddress || expanded) && (
          <a
            href={`${INITIA_TESTNET.explorerUrl}/accounts/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-400 hover:text-zinc-600 truncate font-mono"
          >
            {address}
          </a>
        )}
      </div>
      {!showAddress && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-zinc-400 hover:text-zinc-600 flex-shrink-0"
          title="Show address"
        >
          {expanded ? "▲" : "▼"}
        </button>
      )}
    </div>
  )
}
