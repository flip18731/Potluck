"use client"

import { use, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useInterwovenKit } from "@initia/interwovenkit-react"
import type { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx"
import { AppNav } from "@/components/chrome/AppNav"
import { Avatar } from "@/components/ui/Avatar"
import { fromMicro, INITIA_TESTNET } from "@/lib/initia/chain"
import { atInitHandle } from "@/lib/initia/display"
import { toast } from "sonner"
import { HEARTH } from "@/lib/design/tokens"
import { humanizeTxError } from "@/lib/initia/tx-errors"

interface Balance {
  address: string
  username: string | null
  contributed: string
  expenseShare: string
  netBalance: string
}

interface PoolData {
  pool: {
    id: string
    name: string
    description: string | null
    creator_address: string
    status: "open" | "closed"
    denom: string
    created_at: string
  }
  balances: Balance[]
}

type Phase = "pre" | "settling" | "done"

const Dots = () => (
  <span aria-hidden="true">
    <span className="dot dot-1">·</span>
    <span className="dot dot-2">·</span>
    <span className="dot dot-3">·</span>
  </span>
)

/** Interwoven Bridge routing chip — matches Clear_the_Table.html (last non-me recipient → Osmosis, you → Mantle). */
function settlementBridgeChip(
  balance: Balance,
  allBalances: Balance[],
  currentUserAddress: string | undefined
): { label: string | null; showChange: boolean } {
  const net = BigInt(balance.netBalance)
  if (net <= 0n) return { label: null, showChange: false }
  const isMe = balance.address === currentUserAddress
  if (isMe) return { label: "Mantle", showChange: true }

  let lastNonMePositiveAddr: string | null = null
  for (const b of allBalances) {
    if (BigInt(b.netBalance) <= 0n) continue
    if (b.address === currentUserAddress) continue
    lastNonMePositiveAddr = b.address
  }
  if (lastNonMePositiveAddr && balance.address === lastNonMePositiveAddr) {
    return { label: "Osmosis", showChange: false }
  }
  return { label: null, showChange: false }
}

function DistRow({
  balance,
  rowIdx,
  phase,
  currentUserAddress,
  viewerUsername,
  allBalances,
}: {
  balance: Balance
  rowIdx: number
  phase: Phase
  currentUserAddress?: string
  viewerUsername?: string | null
  allBalances: Balance[]
}) {
  const net = BigInt(balance.netBalance)
  const amount = net > 0n ? net : 0n
  const isZero = amount === 0n
  const isMe = balance.address === currentUserAddress
  const handle = balance.username || balance.address.slice(0, 8)
  const displayName = isMe && viewerUsername ? viewerUsername : balance.username || undefined
  const settling = phase === "settling"
  const subtitle = balance.username ? atInitHandle(balance.username) : `${balance.address.slice(0, 10)}…`
  const { label: routingLabel, showChange } = settlementBridgeChip(balance, allBalances, currentUserAddress)

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "13px 0",
        borderBottom: "1px solid #EDE8E1",
      }}
    >
      <Avatar handle={handle} displayName={displayName} size={30} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 480, color: "#1C1917" }}>
            {displayName || handle}
          </span>
          {isMe && <span style={{ fontSize: 11, color: "#A8A29E" }}>you</span>}
        </div>
        <div className="tabular" style={{ fontSize: 11.5, color: "#A8A29E", marginTop: 1 }}>
          {subtitle}
        </div>
      </div>

      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div
          className={`tabular${settling ? ` settling-pulse row-${rowIdx}` : ""}`}
          style={{
            fontSize: 15,
            fontWeight: isZero ? 400 : 520,
            color: isZero ? "#C4BAB0" : "#1C1917",
            letterSpacing: "-0.015em",
            transition: "color 0.3s",
          }}
        >
          {isZero ? "—" : `+${fromMicro(amount)} INIT`}
        </div>
        {routingLabel && !isZero && (
          <div
            style={{
              marginTop: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 5,
            }}
          >
            <span className="tabular" style={{ fontSize: 11, fontWeight: 550, color: HEARTH }}>→ {routingLabel}</span>
            {showChange && phase === "pre" && (
              <button
                type="button"
                style={{
                  fontSize: 11,
                  color: "#C9C1B8",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  textDecoration: "underline",
                  textDecorationColor: "#DDD6CE",
                  fontFamily: "inherit",
                }}
              >
                change
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SettlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const queryClient = useQueryClient()
  const { address, username, requestTxBlock } = useInterwovenKit()
  const router = useRouter()

  const [phase, setPhase] = useState<Phase>("pre")
  const [confirmStep, setConfirmStep] = useState(false)
  const [settleTxHash, setSettleTxHash] = useState<string | null>(null)

  const { data, isLoading } = useQuery<PoolData>({
    queryKey: ["pool", id],
    queryFn: async () => {
      const res = await fetch(`/api/pools/${id}`)
      if (!res.ok) throw new Error("Pool not found")
      return res.json()
    },
    refetchInterval: 2000,
  })

  const pool = data?.pool
  const balances = data?.balances ?? []
  const recipients = balances.filter((b) => BigInt(b.netBalance) > 0n)
  const total = recipients.reduce((sum, b) => sum + BigInt(b.netBalance), 0n)

  const handleSettle = async () => {
    if (!address) { toast.error("Connect your account"); return }

    setPhase("settling")
    try {
      const poolContractAddress = process.env.NEXT_PUBLIC_POOL_CONTRACT_ADDRESS?.trim()
      if (poolContractAddress) {
        const exec: MsgExecuteContract = {
          sender: address,
          contract: poolContractAddress,
          msg: new TextEncoder().encode(JSON.stringify({ close_pool: { pool_id: id } })),
          funds: [],
        }
        await requestTxBlock({
          messages: [
            {
              typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
              value: exec,
            },
          ],
        })
      }

      const res = await fetch(`/api/pools/${id}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requesterAddress: address }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Settlement failed")

      setSettleTxHash(result.txHash || null)
      setPhase("done")
      await queryClient.invalidateQueries({ queryKey: ["pool", id] })
      await queryClient.invalidateQueries({ queryKey: ["onchain-uinit-balance"] })
    } catch (e: unknown) {
      toast.error(humanizeTxError(e))
      setPhase("pre")
      setConfirmStep(false)
    }
  }

  const backLabel = phase === "done" ? "Dashboard" : (pool?.name || "Back")
  const backHref = phase === "done" ? "/dashboard" : `/p/${id}`

  if (isLoading || !pool) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F8F5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 14, color: "#C4BAB0" }}>Loading…</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F5F0", paddingBottom: 72 }}>
      <AppNav backLabel={backLabel} backHref={backHref} />

      <main className="settle-main" style={{ maxWidth: 520, margin: "0 auto", padding: "48px 32px 32px" }}>

        {/* ── Pre-commit ── */}
        {phase === "pre" && (
          <div>
            <div style={{ marginBottom: 30 }}>
              <p style={{ fontSize: 12, color: "#A8A29E", fontWeight: 450, marginBottom: 8 }}>
                {pool.name}
                {pool.description && ` · ${pool.description}`}
              </p>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 640,
                  letterSpacing: "-0.025em",
                  color: "#1C1917",
                  lineHeight: 1.1,
                  marginBottom: 5,
                }}
              >
                Clear the table
              </h1>
              <p style={{ fontSize: 14, color: "#A8A29E" }}>
                Everyone{"\u2019"}s covered. Review the distribution below.
              </p>
            </div>

            {/* Total header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 0 14px",
                borderBottom: "1px solid #EDE8E1",
              }}
            >
              <span style={{ fontSize: 12, color: "#A8A29E", fontWeight: 450 }}>Distributing</span>
              <span className="tabular" style={{ fontSize: 15.5, fontWeight: 600, color: "#1C1917", letterSpacing: "-0.02em" }}>
                {fromMicro(total)} INIT
              </span>
            </div>

            {/* Distribution rows */}
            {balances.map((b, i) => (
              <DistRow
                key={b.address}
                balance={b}
                rowIdx={i}
                phase="pre"
                currentUserAddress={address}
                viewerUsername={username}
                allBalances={balances}
              />
            ))}

            {/* Footer summary */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 0 0",
                marginBottom: 36,
              }}
            >
              <span style={{ fontSize: 13, color: "#78716C", fontWeight: 490 }}>
                {balances.length} member{balances.length !== 1 ? "s" : ""} · all covered
              </span>
              <span className="tabular" style={{ fontSize: 14, fontWeight: 560, color: "#1C1917", letterSpacing: "-0.015em" }}>
                {fromMicro(total)} INIT
              </span>
            </div>

            <div style={{ height: 1, background: "#EDE8E1", marginBottom: 26 }} />

            <button
              onClick={() => {
                if (!confirmStep) {
                  setConfirmStep(true)
                } else {
                  handleSettle()
                }
              }}
              style={{
                width: "100%",
                padding: "14px 0",
                backgroundColor: confirmStep ? "#1C1917" : HEARTH,
                color: "#FFFFFF",
                border: "none",
                borderRadius: 7,
                fontSize: 15,
                fontWeight: 590,
                cursor: "pointer",
                letterSpacing: "-0.01em",
                transition: "background-color 0.22s ease",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {confirmStep ? "Confirm — clear the table" : "Clear the table"}
            </button>

            <p style={{ textAlign: "center", fontSize: 12, color: "#C4BAB0", marginTop: 10 }}>
              {confirmStep
                ? "Everyone is paid out together. This can't be undone."
                : "This action archives the potluck and can't be undone."}
            </p>
          </div>
        )}

        {/* ── Settling ── */}
        {phase === "settling" && (
          <div>
            <div style={{ marginBottom: 30 }}>
              <p style={{ fontSize: 12, color: "#A8A29E", fontWeight: 450, marginBottom: 8 }}>
                {pool.name}
              </p>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 640,
                  letterSpacing: "-0.025em",
                  color: "#1C1917",
                  lineHeight: 1.1,
                  marginBottom: 5,
                }}
              >
                Clear the table
              </h1>
              <p style={{ fontSize: 14, color: "#A8A29E" }}>
                Settling up<Dots />
              </p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 0 14px",
                borderBottom: "1px solid #EDE8E1",
              }}
            >
              <span style={{ fontSize: 12, color: "#A8A29E", fontWeight: 450 }}>Distributing</span>
              <span className="tabular" style={{ fontSize: 15.5, fontWeight: 600, color: "#1C1917", letterSpacing: "-0.02em" }}>
                {fromMicro(total)} INIT
              </span>
            </div>

            {balances.map((b, i) => (
              <DistRow
                key={b.address}
                balance={b}
                rowIdx={i}
                phase="settling"
                currentUserAddress={address}
                viewerUsername={username}
                allBalances={balances}
              />
            ))}

            <div style={{ padding: "18px 0 0", marginBottom: 36 }}>
              <span style={{ fontSize: 13, color: "#C4BAB0" }}>
                {balances.length} member{balances.length !== 1 ? "s" : ""} · all covered
              </span>
            </div>

            <div style={{ height: 1, background: "#EDE8E1", marginBottom: 26 }} />

            <div
              style={{
                width: "100%",
                padding: "14px 0",
                backgroundColor: "#EDE8E1",
                borderRadius: 7,
                textAlign: "center",
                fontSize: 14,
                color: "#B8B0A8",
                fontWeight: 490,
                letterSpacing: "-0.005em",
                userSelect: "none",
              }}
            >
              Settling<Dots />
            </div>
          </div>
        )}

        {/* ── Done / Aftermath ── */}
        {phase === "done" && (
          <div className="fade-up">
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
                <p style={{ fontSize: 12, color: "#A8A29E", fontWeight: 450, margin: 0 }}>
                  {pool.name}
                </p>
                <span
                  className="badge-pop"
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
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 640,
                  letterSpacing: "-0.025em",
                  color: "#1C1917",
                  lineHeight: 1.1,
                  marginBottom: 5,
                }}
              >
                All settled.
              </h1>
              <p style={{ fontSize: 14, color: "#A8A29E" }}>
                {fromMicro(total)} INIT distributed
                {settleTxHash && (
                  <>
                    {" · "}
                    <a
                      href={`${INITIA_TESTNET.explorerUrl}/txs/${settleTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: HEARTH, textDecoration: "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                    >
                      View receipt ↗
                    </a>
                  </>
                )}
              </p>
            </div>

            {/* Distribution confirmed */}
            <div style={{ borderBottom: "1px solid #EDE8E1" }}>
              {balances.map((b, i) => (
                <DistRow
                  key={b.address}
                  balance={b}
                  rowIdx={i}
                  phase="done"
                  currentUserAddress={address}
                  viewerUsername={username}
                  allBalances={balances}
                />
              ))}
            </div>

            {/* My routing confirmation */}
            {(() => {
              const myBal = balances.find((b) => b.address === address)
              const myNet = myBal ? BigInt(myBal.netBalance) : 0n
              if (myNet <= 0n) return null
              return (
                <div
                  style={{
                    padding: "15px 16px",
                    backgroundColor: "#FDF3E8",
                    borderRadius: 7,
                    margin: "20px 0 30px",
                  }}
                >
                  <p style={{ fontSize: 13.5, color: "#78716C", lineHeight: 1.6, margin: 0 }}>
                    <span className="tabular" style={{ fontWeight: 560, color: "#4A3D35" }}>
                      {fromMicro(myNet)} INIT
                    </span>
                    {" "}is on its way to your account. Usually arrives within a few minutes.
                  </p>
                </div>
              )
            })()}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => router.push(`/p/${id}/archive`)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  backgroundColor: "transparent",
                  border: "1px solid #E2D9CE",
                  borderRadius: 6,
                  fontSize: 13.5,
                  fontWeight: 450,
                  color: "#78716C",
                  cursor: "pointer",
                  transition: "border-color 0.15s, color 0.15s",
                  fontFamily: "inherit",
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
                View full history
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  backgroundColor: "#1C1917",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: "#FFFFFF",
                  cursor: "pointer",
                  transition: "opacity 0.15s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Back to dashboard
              </button>
            </div>
          </div>
        )}
      </main>
      <style>{`
        @media (max-width: 768px) {
          .settle-main { padding: 32px 20px 24px !important; }
        }
      `}</style>
    </div>
  )
}
