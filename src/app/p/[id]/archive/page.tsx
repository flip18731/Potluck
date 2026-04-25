"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { AppNav } from "@/components/chrome/AppNav"
import { ExpenseFeed } from "@/components/potluck/ExpenseFeed"
import { BalanceBoard } from "@/components/potluck/BalanceBoard"
import { fromMicro, INITIA_TESTNET } from "@/lib/initia/chain"
import { HEARTH } from "@/lib/design/tokens"

export default function ArchivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["pool", id],
    queryFn: async () => {
      const res = await fetch(`/api/pools/${id}`)
      if (!res.ok) throw new Error("Not found")
      return res.json()
    },
  })

  const pool = data?.pool

  const downloadCSV = () => {
    if (!data) return
    const rows = [
      ["Type", "Description", "Amount (INIT)", "Address", "Username", "Date", "Tx Hash"],
      ...data.contributions.map((c: { amount: string; member_address: string; member_username: string | null; created_at: string; tx_hash: string }) => [
        "Contribution",
        "Brought to the table",
        fromMicro(c.amount),
        c.member_address,
        c.member_username || "",
        new Date(c.created_at).toISOString(),
        c.tx_hash,
      ]),
      ...data.expenses.map((e: { description: string; amount: string; paid_by_address: string; paid_by_username: string | null; created_at: string; reimburse_tx_hash: string | null }) => [
        "Expense",
        e.description,
        fromMicro(e.amount),
        e.paid_by_address,
        e.paid_by_username || "",
        new Date(e.created_at).toISOString(),
        e.reimburse_tx_hash || "",
      ]),
    ]
    const csv = rows.map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `potluck-${pool?.name?.replace(/\s+/g, "-")}-${id.slice(0, 8)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F8F5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 14, color: "#C4BAB0" }}>Loading archive…</div>
      </div>
    )
  }

  if (isError || !pool) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F8F5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "#A8A29E", marginBottom: 16 }}>Potluck not found</p>
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              fontSize: 13,
              color: HEARTH,
              background: "none",
              border: `1px solid #E2D9CE`,
              borderRadius: 6,
              padding: "8px 18px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F5F0" }}>
      <AppNav backLabel={pool.name} backHref={`/p/${id}`} />

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 32px 64px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 36,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 640,
                  letterSpacing: "-0.02em",
                  color: "#1C1917",
                  margin: 0,
                }}
              >
                {pool.name}
              </h1>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "2px 7px",
                  borderRadius: 20,
                  backgroundColor: "#F0EBE3",
                  color: "#A8A29E",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Archived
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#A8A29E", margin: 0 }}>
              Full history · {data.expenses.length} expense{data.expenses.length !== 1 ? "s" : ""} · {data.contributions.length} contribution{data.contributions.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={downloadCSV}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                color: "#78716C",
                background: "none",
                border: "1px solid #E2D9CE",
                borderRadius: 6,
                padding: "8px 14px",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = HEARTH
                e.currentTarget.style.color = HEARTH
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#E2D9CE"
                e.currentTarget.style.color = "#78716C"
              }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1v8M3.5 6.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1.5 10.5v.5a1 1 0 001 1h9a1 1 0 001-1v-.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Download CSV
            </button>

            {pool.tx_hash && (
              <a
                href={`${INITIA_TESTNET.explorerUrl}/txs/${pool.tx_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  color: "#78716C",
                  background: "none",
                  border: "1px solid #E2D9CE",
                  borderRadius: 6,
                  padding: "8px 14px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textDecoration: "none",
                  transition: "border-color 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = HEARTH
                  e.currentTarget.style.color = HEARTH
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E2D9CE"
                  e.currentTarget.style.color = "#78716C"
                }}
              >
                Settlement tx ↗
              </a>
            )}
          </div>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "3fr 2fr",
            gap: 48,
            alignItems: "start",
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: "#A8A29E", fontWeight: 450, letterSpacing: "0.01em", marginBottom: 14 }}>
              Activity
            </div>
            <ExpenseFeed
              expenses={data.expenses}
              contributions={data.contributions}
              members={pool.members}
            />
          </div>
          <div>
            <BalanceBoard
              balances={data.balances}
              denom={pool.denom}
              poolStatus="closed"
            />
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 720px) {
          main > div:last-child { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </div>
  )
}
