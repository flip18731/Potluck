"use client"

import { useState, useEffect } from "react"
import {
  enableAutoSign, isAutoSignEnabled, autoSignExpiresIn, revokeAutoSign, formatExpiry,
} from "@/lib/initia/autosign"
import { HEARTH } from "@/lib/design/tokens"

interface AutoSignPromptProps {
  poolId: string
}

export function AutoSignPrompt({ poolId }: AutoSignPromptProps) {
  const [enabled, setEnabled] = useState(false)
  const [expiresIn, setExpiresIn] = useState(0)

  useEffect(() => {
    setEnabled(isAutoSignEnabled(poolId))
    setExpiresIn(autoSignExpiresIn(poolId))
    const interval = setInterval(() => {
      setEnabled(isAutoSignEnabled(poolId))
      setExpiresIn(autoSignExpiresIn(poolId))
    }, 30_000)
    return () => clearInterval(interval)
  }, [poolId])

  if (enabled) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          backgroundColor: "#FDF3E8",
          border: "1px solid #F0E0C8",
          borderRadius: 8,
          padding: "12px 14px",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: HEARTH,
            opacity: 0.8,
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#78716C" }}>One-tap approval active</div>
          <div style={{ fontSize: 12, color: "#A8A29E", marginTop: 1 }}>
            No popups for {formatExpiry(expiresIn)}
          </div>
        </div>
        <button
          onClick={() => { revokeAutoSign(poolId); setEnabled(false) }}
          style={{
            fontSize: 12,
            color: "#A8A29E",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: 4,
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#78716C")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#A8A29E")}
        >
          Revoke
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        backgroundColor: "#FAF8F5",
        border: "1px solid #EDE8E1",
        borderRadius: 8,
        padding: "12px 14px",
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "#C4BAB0",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#78716C" }}>One-tap approval</div>
        <div style={{ fontSize: 12, color: "#A8A29E", marginTop: 1 }}>
          Skip signature popups for 24h
        </div>
      </div>
      <button
        onClick={() => { enableAutoSign(poolId); setEnabled(true); setExpiresIn(24 * 60 * 60 * 1000) }}
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: HEARTH,
          background: "none",
          border: `1px solid #E2D9CE`,
          borderRadius: 5,
          cursor: "pointer",
          padding: "5px 12px",
          fontFamily: "inherit",
          transition: "border-color 0.15s, opacity 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        Enable
      </button>
    </div>
  )
}
