"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useInterwovenKit } from "@initia/interwovenkit-react"
import { AppNav } from "@/components/chrome/AppNav"
import { BalanceBoard } from "@/components/potluck/BalanceBoard"
import { ExpenseFeed } from "@/components/potluck/ExpenseFeed"
import { fromMicro } from "@/lib/initia/chain"

interface PoolData {
  pool: {
    id: string
    name: string
    description: string | null
    creator_address: string
    creator_username: string | null
    members: Array<{ address: string; username: string | null }>
    status: "open" | "closed"
    denom: string
    tx_hash: string | null
    created_at: string
  }
  contributions: Array<{
    id: string
    member_address: string
    member_username: string | null
    amount: string
    tx_hash: string
    created_at: string
  }>
  expenses: Array<{
    id: string
    description: string
    amount: string
    paid_by_address: string
    paid_by_username: string | null
    split_between: string[]
    reimbursed: boolean
    reimburse_tx_hash: string | null
    created_at: string
  }>
  balances: Array<{
    address: string
    username: string | null
    contributed: string
    expenseShare: string
    netBalance: string
  }>
}

export default function ArchivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { address } = useInterwovenKit()

  const { data, isLoading } = useQuery<PoolData>({
    queryKey: ["pool", id],
    queryFn: async () => {
      const res = await fetch(`/api/pools/${id}`)
      if (!res.ok) throw new Error("Pool not found")
      return res.json()
    },
  })

  const pool = data?.pool

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F8F5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 14, color: "#C4BAB0" }}>Loading archive…</div>
      </div>
    )
  }

  if (!pool) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F8F5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "#A8A29E", marginBottom: 16 }}>Potluck not found</p>
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              padding: "10px 18px",
              border: "1px solid #E2D9CE",
              borderRadius: 6,
              background: "#FFFFFF",
              color: "#78716C",
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

  const totalContributed = data?.contributions.reduce((sum, c) => sum + BigInt(c.amount), 0n) ?? 0n
  const totalExpenses = data?.expenses.reduce((sum, e) => sum + BigInt(e.amount), 0n) ?? 0n
  const memberCount = pool.members.length
  const perPerson = memberCount > 0 ? totalExpenses / BigInt(memberCount) : 0n

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F5F0" }}>
      <AppNav backLabel="Dashboard" backHref="/dashboard" />

      <main
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "40px 32px 64px",
          display: "grid",
          gridTemplateColumns: "3fr 2fr",
          gap: 48,
          alignItems: "start",
        }}
      >
        <div>
          <header style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
              <h1
                style={{
                  fontSize: 30,
                  fontWeight: 640,
                  letterSpacing: "-0.02em",
                  color: "#1C1917",
                  margin: 0,
                  lineHeight: 1.1,
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

            {pool.description && (
              <p style={{ fontSize: 14, color: "#A8A29E", margin: 0 }}>
                {pool.description}
              </p>
            )}

            <div style={{ display: "flex", gap: 0, marginTop: 18 }}>
              {[
                { label: "Pot balance", value: `${fromMicro(totalContributed)} INIT` },
                { label: "The spread", value: `${fromMicro(totalExpenses)} INIT` },
                { label: "Per person", value: `${fromMicro(perPerson)} INIT` },
              ].map((stat, i) => (
                <div key={stat.label} style={{ display: "flex", alignItems: "stretch" }}>
                  {i > 0 && <div style={{ width: 1, background: "#EDE8E1", margin: "0 24px" }} />}
                  <div>
                    <div style={{ fontSize: 11, color: "#A8A29E", fontWeight: 450, marginBottom: 4, letterSpacing: "0.02em" }}>
                      {stat.label}
                    </div>
                    <div className="tabular" style={{ fontSize: 22, fontWeight: 620, color: "#1C1917", letterSpacing: "-0.02em" }}>
                      {stat.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </header>

          <div style={{ height: 1, background: "#EDE8E1", margin: "0 0 28px" }} />

          <section style={{ marginBottom: 36 }}>
            <BalanceBoard
              balances={data?.balances ?? []}
              denom={pool.denom}
              poolStatus="closed"
              currentUserAddress={address}
            />
          </section>

          <div style={{ height: 1, background: "#EDE8E1", margin: "0 0 28px" }} />

          <section>
            <div style={{ fontSize: 12, color: "#A8A29E", fontWeight: 450, letterSpacing: "0.01em", marginBottom: 14 }}>
              The spread · {data?.expenses.length ?? 0} expense{(data?.expenses.length ?? 0) !== 1 ? "s" : ""}
            </div>
            <ExpenseFeed
              expenses={data?.expenses ?? []}
              contributions={data?.contributions ?? []}
              members={pool.members}
              currentUserAddress={address}
            />
          </section>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "sticky", top: 68 }}>
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2D9CE",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <div style={{ height: 3, backgroundColor: "#B8B0A8" }} />
            <div style={{ padding: "20px 20px 22px" }}>
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 620,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#A8A29E",
                  marginBottom: 18,
                }}
              >
                Potluck archived
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { label: "Members", value: `${pool.members.length}` },
                  { label: "Total contributed", value: `${fromMicro(totalContributed)} INIT` },
                  { label: "Total spent", value: `${fromMicro(totalExpenses)} INIT` },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      padding: "7px 0",
                      borderBottom: "1px solid #F0EBE3",
                    }}
                  >
                    <span style={{ fontSize: 13, color: "#78716C" }}>{row.label}</span>
                    <span className="tabular" style={{ fontSize: 13, fontWeight: 500, color: "#1C1917" }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <button
                disabled
                style={{
                  width: "100%",
                  marginTop: 14,
                  padding: "11px 0",
                  borderRadius: 6,
                  border: "1px solid #E2D9CE",
                  backgroundColor: "#FAF8F5",
                  color: "#C4BAB0",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "not-allowed",
                  fontFamily: "inherit",
                }}
              >
                Add to the spread (disabled)
              </button>
            </div>
          </div>

          <button
            disabled
            style={{
              width: "100%",
              padding: "10px 0",
              fontSize: 13,
              color: "#C4BAB0",
              background: "#FAF8F5",
              border: "1px solid #E2D9CE",
              borderRadius: 6,
              cursor: "not-allowed",
              fontFamily: "inherit",
            }}
          >
            Clear the table (disabled)
          </button>
        </div>
      </main>

      <style>{`
        @media (max-width: 720px) {
          main {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
            padding: 24px 20px 80px !important;
            position: relative !important;
          }
          main > div:last-child { position: static !important; }
        }
      `}</style>
    </div>
  )
}
