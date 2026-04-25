"use client"

import { Arc } from "@/components/ui/Arc"
import { Avatar } from "@/components/ui/Avatar"
import { fromMicro } from "@/lib/initia/chain"

interface Balance {
  address: string
  username: string | null
  contributed: string
  expenseShare: string
  netBalance: string
}

interface BalanceBoardProps {
  balances: Balance[]
  denom: string
  poolStatus: "open" | "closed"
  currentUserAddress?: string
}

export function BalanceBoard({ balances, denom, poolStatus: _poolStatus, currentUserAddress }: BalanceBoardProps) {
  // Compute total expense share for arc pct denominator (use expenseShare per member)
  return (
    <section aria-labelledby="balance-heading">
      {/* Section label */}
      <div style={{ fontSize: 12, color: "#A8A29E", fontWeight: 450, letterSpacing: "0.01em", marginBottom: 14 }}>
        Balance board
      </div>

      <div role="table" aria-label="Member balance states">
        {balances.map((b, index) => {
          const net = BigInt(b.netBalance)
          const isPositive = net > 0n
          const isNegative = net < 0n
          const isZero = net === 0n

          // Arc pct: contributed / expenseShare, clamp 0-1
          let arcPct = 0
          const expenseShareBig = BigInt(b.expenseShare)
          const contributedBig = BigInt(b.contributed)
          if (expenseShareBig > 0n) {
            // Use floating point via Number for pct
            arcPct = Math.min(1, Math.max(0, Number(contributedBig) / Number(expenseShareBig)))
          }

          const isMe = currentUserAddress ? b.address === currentUserAddress : false
          const handle = b.address.slice(-8)
          const netAbs = isNegative ? -net : net

          let netLabel = "square"
          let netClass = "net-zero"
          if (isPositive) { netLabel = "getting back"; netClass = "net-positive" }
          if (isNegative) { netLabel = "still to bring"; netClass = "net-negative" }

          const displayName = b.username || undefined
          const subtitle = b.username ? `@${b.username}` : `@${b.address.slice(0, 8)}`

          return (
            <div
              key={b.address}
              className={`fade-slide${isMe ? " is-me" : ""}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: isMe ? "13px 4px" : "13px 0",
                borderBottom: index === balances.length - 1 ? "none" : "1px solid #EDE8E1",
                animationDelay: `${index * 40}ms`,
                ...(isMe ? {
                  margin: "0 -4px",
                  background: "#FAF8F5",
                  borderRadius: 6,
                  borderBottomColor: "transparent",
                } : {}),
              }}
              role="row"
              aria-label={`${displayName || handle}: ${fromMicro(netAbs)} INIT net`}
            >
              {/* Arc */}
              <Arc pct={arcPct} size={40} delay={index * 60} />

              {/* Identity block */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                <Avatar handle={handle} displayName={displayName} size={32} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#1C1917", lineHeight: 1.25 }}>
                      {displayName || b.address.slice(0, 8)}
                    </span>
                    {isMe && (
                      <span style={{ fontSize: 11, color: "#A8A29E", fontWeight: 400 }}>you</span>
                    )}
                  </div>
                  <div className="tabular" style={{ fontSize: 12, color: "#A8A29E", marginTop: 1 }}>
                    {subtitle}
                  </div>
                </div>
              </div>

              {/* Brought — hidden on mobile */}
              <div className="mobile-hidden" style={{ textAlign: "right", flexShrink: 0, minWidth: 64 }}>
                <div style={{ fontSize: 11, color: "#C4BAB0", marginBottom: 2 }}>brought</div>
                <div className="tabular" style={{ fontSize: 13, color: "#A8A29E" }}>
                  {fromMicro(b.contributed)} INIT
                </div>
              </div>

              {/* Net position */}
              <div style={{ textAlign: "right", flexShrink: 0, minWidth: 80 }}>
                <div style={{ fontSize: 11, color: "#C4BAB0", marginBottom: 2 }}>{netLabel}</div>
                <div className={`tabular ${netClass}`} style={{ fontSize: 13 }}>
                  {isZero ? (
                    <span style={{ color: "#C4BAB0" }}>—</span>
                  ) : isPositive ? (
                    <span style={{ fontWeight: 510, color: "#1C1917" }}>+{fromMicro(netAbs)} INIT</span>
                  ) : (
                    <span style={{ fontWeight: 400, color: "#A8A29E" }}>−{fromMicro(netAbs)} INIT</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {balances.length === 0 && (
          <div style={{ padding: "24px 0", textAlign: "center", fontSize: 13, color: "#C4BAB0" }}>
            No contributions yet
          </div>
        )}
      </div>
    </section>
  )
}
