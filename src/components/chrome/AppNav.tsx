"use client"

import { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useInterwovenKit } from "@initia/interwovenkit-react"
import { CREAM } from "@/lib/design/tokens"
import { atInitHandle } from "@/lib/initia/display"

interface AppNavProps {
  backLabel?: string
  backHref?: string
  right?: ReactNode
}

export function AppNav({ backLabel = "Dashboard", backHref, right }: AppNavProps) {
  const router = useRouter()
  const { username, isConnected } = useInterwovenKit()

  const handleBack = () => {
    if (backHref) router.push(backHref)
    else router.back()
  }

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        backgroundColor: CREAM,
        borderBottom: "1px solid #EDE8E1",
      }}
      aria-label="Potluck navigation"
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "0 32px",
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {backLabel ? (
          <button
            onClick={handleBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "#A8A29E",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontFamily: "inherit",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#1C1917")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#A8A29E")}
            aria-label={`Back to ${backLabel}`}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <path d="M9.5 12L5 7.5 9.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {backLabel}
          </button>
        ) : (
          <div />
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isConnected && username && (
            <span className="tabular" style={{ fontSize: 12, color: "#A8A29E" }}>
              {atInitHandle(username)}
            </span>
          )}
          {right}
        </div>
      </div>
    </nav>
  )
}

interface OneTapPillProps {
  expiresLabel: string
  onClick?: () => void
}

export function OneTapPill({ expiresLabel, onClick }: OneTapPillProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 20,
        backgroundColor: "#FDF3E8",
        fontSize: 11.5,
        fontWeight: 500,
        color: "#C07A38",
        border: "none",
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "opacity 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#C07A38", opacity: 0.8 }} />
      One-tap · {expiresLabel}
    </button>
  )
}
