"use client"

import { useInterwovenKit } from "@initia/interwovenkit-react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { AppNav } from "@/components/chrome/AppNav"
import { CTABtn } from "@/components/ui/CTABtn"
import { HEARTH } from "@/lib/design/tokens"
import { DbPool } from "@/lib/potluck/types"
import { atInitHandle } from "@/lib/initia/display"
import { useState } from "react"

function useMyPotlucks(address: string | undefined) {
  return useQuery({
    queryKey: ["pools", address],
    queryFn: async () => {
      if (!address) return []
      const res = await fetch(`/api/pools?member=${address}`)
      if (!res.ok) throw new Error("Failed to load potlucks")
      return res.json() as Promise<DbPool[]>
    },
    enabled: !!address,
    refetchInterval: 8000,
  })
}

export default function DashboardPage() {
  const { address, username, openConnect } = useInterwovenKit()
  const router = useRouter()
  const { data: pools, isLoading } = useMyPotlucks(address)

  const displayName = username ? atInitHandle(username) : address ? `${address.slice(0, 12)}…` : null

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8F5F0",
        fontFamily: "inherit",
      }}
    >
      <AppNav
        backLabel=""
        right={
          <CTABtn size="sm" onClick={() => router.push("/p/new")}>
            Set the table →
          </CTABtn>
        }
      />

      <main
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "40px 32px",
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 32,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 21,
                fontWeight: 620,
                letterSpacing: "-0.02em",
                color: "#1C1917",
                marginBottom: 3,
                marginTop: 0,
              }}
            >
              Your potlucks
            </h1>
            <p style={{ fontSize: 13, color: "#A8A29E", margin: 0 }}>
              {displayName ?? ""}
            </p>
          </div>
        </div>

        {/* Not connected */}
        {!address && (
          <div
            style={{
              border: "1.5px dashed #DDD6CE",
              borderRadius: 10,
              padding: "72px 48px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: 16,
                fontWeight: 490,
                color: "#78716C",
                marginBottom: 8,
                marginTop: 0,
              }}
            >
              Sign in to see your potlucks
            </p>
            <p
              style={{
                fontSize: 14,
                color: "#A8A29E",
                marginBottom: 30,
                marginTop: 0,
                lineHeight: 1.65,
                maxWidth: 320,
                margin: "0 auto 30px",
              }}
            >
              Start one for your next trip, dinner, or anything your group shares the bill for.
            </p>
            <CTABtn onClick={openConnect}>Sign in</CTABtn>
          </div>
        )}

        {/* Loading */}
        {address && isLoading && (
          <div style={{ fontSize: 14, color: "#C4BAB0", padding: "24px 0" }}>Loading your potlucks…</div>
        )}

        {/* Empty state */}
        {address && !isLoading && (!pools || pools.length === 0) && (
          <div
            style={{
              border: "1.5px dashed #DDD6CE",
              borderRadius: 10,
              padding: "72px 48px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: 16,
                fontWeight: 490,
                color: "#78716C",
                marginBottom: 8,
                marginTop: 0,
              }}
            >
              No potlucks yet.
            </p>
            <p
              style={{
                fontSize: 14,
                color: "#A8A29E",
                lineHeight: 1.65,
                maxWidth: 320,
                margin: "0 auto 30px",
              }}
            >
              Start one for your next trip, dinner, or anything your group shares the bill for.
            </p>
            <CTABtn onClick={() => router.push("/p/new")}>Set the table →</CTABtn>
          </div>
        )}

        {/* Pool cards */}
        {pools && pools.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pools.map((pool) => (
              <PoolCard key={pool.id} pool={pool} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function PoolCard({ pool }: { pool: DbPool }) {
  const memberCount = (pool.members as Array<{ address: string }>).length
  const timeAgo = formatDistanceToNow(new Date(pool.created_at), { addSuffix: true })
  const desc = pool.description
    ? pool.description.length > 40
      ? pool.description.slice(0, 40) + "…"
      : pool.description
    : null

  const isOpen = pool.status === "open"

  return (
    <Link href={`/p/${pool.id}`} style={{ textDecoration: "none" }}>
      <PoolCardInner pool={pool} memberCount={memberCount} timeAgo={timeAgo} desc={desc} isOpen={isOpen} />
    </Link>
  )
}

function PoolCardInner({
  pool,
  memberCount,
  timeAgo,
  desc,
  isOpen,
}: {
  pool: DbPool
  memberCount: number
  timeAgo: string
  desc: string | null
  isOpen: boolean
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "#FFFFFF",
        border: `1px solid ${hovered ? HEARTH : "#E2D9CE"}`,
        borderRadius: 10,
        padding: "16px 20px",
        cursor: "pointer",
        transition: "border-color 0.15s",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* Left */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontSize: 15,
              fontWeight: 540,
              color: "#1C1917",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {pool.name}
          </span>
          {isOpen ? (
            <span
              style={{
                fontSize: 11,
                color: HEARTH,
                backgroundColor: "#FDF3E8",
                padding: "2px 8px",
                borderRadius: 20,
                flexShrink: 0,
              }}
            >
              Open
            </span>
          ) : (
            <span
              style={{
                fontSize: 11,
                color: "#A8A29E",
                backgroundColor: "#F0EBE3",
                padding: "2px 8px",
                borderRadius: 20,
                flexShrink: 0,
              }}
            >
              Cleared
            </span>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 12,
            fontSize: 12.5,
            color: "#A8A29E",
          }}
        >
          <span>{memberCount} members</span>
          <span>{timeAgo}</span>
          {desc && (
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {desc}
            </span>
          )}
        </div>
      </div>

      {/* Right: chevron */}
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
        <path
          d="M5.5 3L10 7.5 5.5 12"
          stroke="#C4BAB0"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

