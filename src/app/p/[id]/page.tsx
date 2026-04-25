"use client"

import { useInterwovenKit } from "@initia/interwovenkit-react"
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { use, useState, useRef, Fragment, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppNav, OneTapPill } from "@/components/chrome/AppNav"
import { AvatarStack } from "@/components/ui/Avatar"
import { CTABtn } from "@/components/ui/CTABtn"
import { BalanceBoard } from "@/components/potluck/BalanceBoard"
import { ExpenseFeed } from "@/components/potluck/ExpenseFeed"
import { AddExpenseModal } from "@/components/potluck/AddExpenseModal"
import { AutoSignPrompt } from "@/components/potluck/AutoSignPrompt"
import { fromMicro, parseMicroAmount, INITIA_TESTNET, UINIT_DENOM } from "@/lib/initia/chain"
import { useOnChainUinitBalance } from "@/lib/initia/on-chain-balance"
import {
  AUTOSIGN_CHANGED_EVENT,
  isAutoSignEnabled,
  autoSignExpiresIn,
  formatExpiry,
} from "@/lib/initia/autosign"
import { toast } from "sonner"
import { HEARTH } from "@/lib/design/tokens"
import { humanizeTxError } from "@/lib/initia/tx-errors"

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

export default function PotluckDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { address, username, requestTxBlock } = useInterwovenKit()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [amount, setAmount] = useState("")
  const [contributing, setContributing] = useState(false)
  const [contributed, setContributed] = useState(false)
  const [lastContributionMicro, setLastContributionMicro] = useState<bigint | null>(null)
  const [inputFocused, setInputFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const [, setAutoSignBump] = useState(0)

  const { data, isLoading } = useQuery<PoolData>({
    queryKey: ["pool", id],
    queryFn: async () => {
      const res = await fetch(`/api/pools/${id}`)
      if (!res.ok) throw new Error("Pool not found")
      return res.json()
    },
    refetchInterval: 2000,
  })

  const potAddress =
    (process.env.NEXT_PUBLIC_POOL_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_TREASURY_ADDRESS || "").trim() ||
    ""
  const { data: onChainPotBalance = 0n } = useOnChainUinitBalance(potAddress || undefined, {
    refetchInterval: 2000,
    enabled: !!potAddress,
  })

  useEffect(() => {
    const onChange = () => {
      queueMicrotask(() => setAutoSignBump((n) => n + 1))
    }
    window.addEventListener(AUTOSIGN_CHANGED_EVENT, onChange)
    return () => window.removeEventListener(AUTOSIGN_CHANGED_EVENT, onChange)
  }, [])

  const autoSignOn = typeof window !== "undefined" && isAutoSignEnabled(id)
  const autoSignExpiry = typeof window !== "undefined" ? autoSignExpiresIn(id) : 0

  const pool = data?.pool
  const isMember = pool?.members.some((m) => m.address === address)
  const isCreator = pool?.creator_address === address

  const totalExpenses = data?.expenses.reduce((sum, e) => sum + BigInt(e.amount), 0n) ?? 0n
  const memberCount = pool?.members.length ?? 0
  const perPerson = memberCount > 0 && totalExpenses > 0n ? totalExpenses / BigInt(memberCount) : 0n

  const myBalance = data?.balances.find((b) => b.address === address)
  const myShare = myBalance ? BigInt(myBalance.expenseShare) : 0n
  const myContributed = myBalance ? BigInt(myBalance.contributed) : 0n
  const myRemaining = myShare > myContributed ? myShare - myContributed : 0n

  const amountMicro = parseMicroAmount(amount)
  const treasuryAddress = process.env.NEXT_PUBLIC_TREASURY_ADDRESS

  const handleContribute = async () => {
    if (!address) { toast.error("Connect your account first"); return }
    if (!amountMicro || amountMicro <= 0n) { toast.error("Enter a valid amount"); return }
    if (!treasuryAddress) { toast.error("Pool account not configured"); return }

    setContributing(true)
    try {
      const amountMicroStr = amountMicro.toString()
      const { transactionHash } = await requestTxBlock({
        messages: [
          {
            typeUrl: "/cosmos.bank.v1beta1.MsgSend",
            value: MsgSend.fromPartial({
              fromAddress: address,
              toAddress: treasuryAddress,
              amount: [{ denom: UINIT_DENOM, amount: amountMicroStr }],
            }),
          },
        ],
      })

      const contribRes = await fetch(`/api/pools/${id}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberAddress: address,
          memberUsername: username || null,
          amount: amountMicroStr,
          txHash: transactionHash,
        }),
      })
      const contribJson = await contribRes.json().catch(() => ({}))
      if (!contribRes.ok) {
        throw new Error(
          typeof contribJson?.error === "string" ? contribJson.error : "Could not record your contribution"
        )
      }

      setContributed(true)
      setLastContributionMicro(amountMicro)
      await queryClient.invalidateQueries({ queryKey: ["pool", id] })
      await queryClient.invalidateQueries({ queryKey: ["onchain-uinit-balance"] })
      toast.success(`Brought ${fromMicro(amountMicro)} INIT to the table!`, {
        action: {
          label: "View",
          onClick: () => window.open(`${INITIA_TESTNET.explorerUrl}/txs/${transactionHash}`, "_blank"),
        },
      })
    } catch (e: unknown) {
      toast.error(humanizeTxError(e))
    } finally {
      setContributing(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F8F5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 14, color: "#C4BAB0" }}>Loading your potluck…</div>
      </div>
    )
  }

  if (!pool) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F8F5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "#A8A29E", marginBottom: 16 }}>Potluck not found</p>
          <CTABtn variant="ghost" onClick={() => router.push("/dashboard")}>Back to dashboard</CTABtn>
        </div>
      </div>
    )
  }

  const memberHandles = pool.members.map((m) => ({
    handle: m.username || m.address.slice(0, 8),
    displayName: m.username,
  }))

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F5F0" }}>
      <AppNav
        backLabel="Dashboard"
        backHref="/dashboard"
        right={autoSignOn ? (
          <OneTapPill expiresLabel={formatExpiry(autoSignExpiry)} />
        ) : undefined}
      />

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
        {/* ═══ LEFT PANEL ═══ */}
        <div>
          {/* Header */}
          <header style={{ marginBottom: 36 }}>
            <h1
              style={{
                fontSize: 30,
                fontWeight: 640,
                letterSpacing: "-0.02em",
                color: "#1C1917",
                margin: "0 0 4px",
                lineHeight: 1.1,
              }}
            >
              {pool.name}
            </h1>
            {pool.description && (
              <p style={{ fontSize: 14, color: "#A8A29E", margin: 0, fontWeight: 400 }}>
                {pool.description}
              </p>
            )}

            {/* Members strip */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18, marginBottom: 24 }}>
              <AvatarStack handles={memberHandles} size={30} max={6} />
              <span style={{ fontSize: 13, color: "#A8A29E" }}>{memberCount} member{memberCount !== 1 ? "s" : ""}</span>
              {pool.status === "open" ? (
                <span
                  style={{
                    fontSize: 11,
                    color: HEARTH,
                    backgroundColor: "#FDF3E8",
                    padding: "2px 8px",
                    borderRadius: 20,
                    fontWeight: 500,
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
                    fontWeight: 500,
                  }}
                >
                  Cleared
                </span>
              )}
            </div>

            {/* Stats cluster */}
            <div style={{ display: "flex", gap: 0 }}>
              {[
                {
                  label: "Pot balance",
                  value: potAddress ? `${fromMicro(onChainPotBalance)} INIT` : "—",
                },
                { label: "The spread", value: fromMicro(totalExpenses) + " INIT" },
                { label: "Per person", value: perPerson > 0n ? fromMicro(perPerson) + " INIT" : "—" },
              ].map((stat, i) => (
                <Fragment key={stat.label}>
                  {i > 0 && (
                    <div style={{ width: 1, background: "#EDE8E1", margin: "0 24px" }} />
                  )}
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#A8A29E",
                        fontWeight: 450,
                        marginBottom: 4,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {stat.label}
                    </div>
                    <div
                      className="tabular"
                      style={{
                        fontSize: 22,
                        fontWeight: 620,
                        color: "#1C1917",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {stat.value}
                    </div>
                  </div>
                </Fragment>
              ))}
            </div>
          </header>

          {/* Divider */}
          <div style={{ height: 1, background: "#EDE8E1", margin: "0 0 28px" }} />

          {/* Balance board */}
          <section aria-labelledby="balance-heading" style={{ marginBottom: 36 }}>
            <BalanceBoard
              balances={data?.balances ?? []}
              currentUserAddress={address}
            />
          </section>

          {/* Divider */}
          <div style={{ height: 1, background: "#EDE8E1", margin: "0 0 28px" }} />

          {/* Expense feed */}
          <section aria-labelledby="expenses-heading">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 12, color: "#A8A29E", fontWeight: 450, letterSpacing: "0.01em" }}>
                The spread · {data?.expenses.length ?? 0} expense{(data?.expenses.length ?? 0) !== 1 ? "s" : ""}
              </span>
            </div>

            <ExpenseFeed
              expenses={data?.expenses ?? []}
              contributions={data?.contributions ?? []}
              currentUserAddress={address}
            />

            {/* Add expense button */}
            {isMember && pool.status === "open" && (
              <AddExpenseModal
                poolId={id}
                members={pool.members}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ["pool", id] })}
                trigger={
                  <button
                    style={{
                      marginTop: 16,
                      width: "100%",
                      padding: "9px 0",
                      fontSize: 13,
                      color: "#A8A29E",
                      fontWeight: 450,
                      background: "none",
                      border: "1px dashed #DDD6CE",
                      borderRadius: 6,
                      cursor: "pointer",
                      transition: "border-color 0.15s, color 0.15s",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = HEARTH
                      e.currentTarget.style.color = HEARTH
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#DDD6CE"
                      e.currentTarget.style.color = "#A8A29E"
                    }}
                  >
                    + Add to the spread
                  </button>
                }
              />
            )}
          </section>
        </div>

        {/* ═══ RIGHT PANEL ═══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "sticky", top: 68 }}>

          {/* ── Bring your share card (open + member) ── */}
          {isMember && pool.status === "open" && (
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2D9CE",
                borderRadius: 10,
                overflow: "hidden",
              }}
              aria-label="Bring your share"
            >
              {/* Hearth accent bar */}
              <div style={{ height: 3, backgroundColor: HEARTH }} />

              <div style={{ padding: "20px 20px 22px" }}>
                <div
                  style={{
                    fontSize: 10.5,
                    fontWeight: 620,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#78716C",
                    marginBottom: 18,
                  }}
                >
                  Bring your share
                </div>

                {/* Breakdown rows */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {[
                    { label: "Your share of expenses", value: fromMicro(myShare) + " INIT" },
                    { label: "You've brought", value: fromMicro(myContributed) + " INIT" },
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

                  {/* Remaining row */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      padding: "10px 0 14px",
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 520, color: "#1C1917" }}>Remaining</span>
                    <span
                      className="tabular"
                      style={{
                        fontSize: 18,
                        fontWeight: 640,
                        color: myRemaining > 0n ? HEARTH : "#A8A29E",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {myRemaining > 0n ? fromMicro(myRemaining) + " INIT" : "—"}
                    </span>
                  </div>
                </div>

                {/* Input / confirmation */}
                {!contributed ? (
                  <>
                    <label
                      htmlFor="bring-amount"
                      style={{ fontSize: 11.5, color: "#A8A29E", display: "block", marginBottom: 6 }}
                    >
                      Amount
                    </label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        border: `1px solid ${inputFocused ? HEARTH : "#DDD6CE"}`,
                        borderRadius: 6,
                        overflow: "hidden",
                        marginBottom: 10,
                        boxShadow: inputFocused ? "0 0 0 3px rgba(192,122,56,0.12)" : "none",
                        transition: "border-color 0.15s, box-shadow 0.15s",
                      }}
                      onClick={() => inputRef.current?.focus()}
                    >
                      <span
                        className="tabular"
                        style={{
                          padding: "0 6px 0 12px",
                          fontSize: 14,
                          color: "#A8A29E",
                          userSelect: "none",
                          flexShrink: 0,
                        }}
                      >
                        INIT
                      </span>
                      <input
                        ref={inputRef}
                        id="bring-amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        onFocus={() => setInputFocused(true)}
                        onBlur={() => setInputFocused(false)}
                        onKeyDown={(e) => e.key === "Enter" && handleContribute()}
                        className="tabular"
                        style={{
                          flex: 1,
                          padding: "10px 12px 10px 4px",
                          fontSize: 15,
                          fontWeight: 550,
                          color: "#1C1917",
                          background: "transparent",
                          border: "none",
                          outline: "none",
                          width: "100%",
                          fontFamily: "inherit",
                        }}
                        aria-label="Amount to bring to the pot"
                      />
                    </div>

                    <CTABtn
                      full
                      onClick={handleContribute}
                      disabled={contributing || !amountMicro || amountMicro <= 0n}
                    >
                      {contributing
                        ? "Sending…"
                        : `Bring ${amountMicro && amountMicro > 0n ? fromMicro(amountMicro) : "0"} INIT to the pot`}
                    </CTABtn>

                    <p style={{ textAlign: "center", fontSize: 11.5, color: "#C4BAB0", margin: "10px 0 0" }}>
                      Settles instantly · visible to all members
                    </p>
                  </>
                ) : (
                  <div className="fade-slide" style={{ textAlign: "center", padding: "8px 0 4px" }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        backgroundColor: "#FDF3E8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 10px",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 8l3.5 3.5L13 5" stroke={HEARTH} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 520, color: "#1C1917", marginBottom: 3 }}>
                      {fromMicro(lastContributionMicro ?? 0n)} INIT on its way
                    </div>
                    <div style={{ fontSize: 12, color: "#A8A29E" }}>
                      The pot will update in a moment
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── One-tap toggle ── */}
          {isMember && pool.status === "open" && (
            <AutoSignPrompt poolId={id} />
          )}

          {/* ── Closing note info card ── */}
          <div
            style={{
              backgroundColor: "#FAF8F5",
              border: "1px solid #EDE8E1",
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ flexShrink: 0, marginTop: 1 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="5.5" stroke="#C4BAB0" strokeWidth="1.2"/>
                  <path d="M7 4v3.5" stroke="#C4BAB0" strokeWidth="1.2" strokeLinecap="round"/>
                  <circle cx="7" cy="10" r="0.6" fill="#C4BAB0"/>
                </svg>
              </div>
              {pool.status === "open" ? (
                <p style={{ margin: 0, fontSize: 12.5, color: "#78716C", lineHeight: 1.55 }}>
                  <span style={{ fontWeight: 520, color: "#4A3D35" }}>Clear the table</span>
                  {" "}is available once everyone{"\u2019"}s covered. The host can close the potluck when all balances are settled.
                </p>
              ) : (
                <p style={{ margin: 0, fontSize: 12.5, color: "#78716C", lineHeight: 1.55 }}>
                  This potluck has been <span style={{ fontWeight: 520, color: "#4A3D35" }}>cleared</span>.
                  {pool.tx_hash && (
                    <>
                      {" "}
                      <a
                        href={`${INITIA_TESTNET.explorerUrl}/txs/${pool.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: HEARTH, textDecoration: "none" }}
                        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                      >
                        View settlement receipt ↗
                      </a>
                    </>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* ── Creator: clear the table ── */}
          {isCreator && pool.status === "open" && (
            <CTABtn
              variant="dark"
              full
              onClick={() => router.push(`/p/${id}/settle`)}
            >
              Clear the table →
            </CTABtn>
          )}

          {/* ── Archive link (closed pool) ── */}
          {pool.status === "closed" && (
            <button
              onClick={() => router.push(`/p/${id}/archive`)}
              style={{
                width: "100%",
                padding: "10px 0",
                fontSize: 13,
                color: "#A8A29E",
                background: "none",
                border: "1px solid #E2D9CE",
                borderRadius: 6,
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
                e.currentTarget.style.color = "#A8A29E"
              }}
            >
              View full history
            </button>
          )}

          {/* ── Share link ── */}
          <InviteLink />
        </div>
      </main>

      <style>{`
        @media (max-width: 720px) {
          main { grid-template-columns: 1fr !important; gap: 32px !important; padding: 24px 20px 80px !important; position: relative !important; }
          main > div:last-child { position: static !important; }
        }
      `}</style>
    </div>
  )
}

function InviteLink() {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        color: copied ? HEARTH : "#A8A29E",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "6px 0",
        fontFamily: "inherit",
        transition: "color 0.15s",
        justifyContent: "center",
      }}
      onMouseEnter={(e) => !copied && (e.currentTarget.style.color = "#78716C")}
      onMouseLeave={(e) => !copied && (e.currentTarget.style.color = "#A8A29E")}
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l2.5 2.5L10 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M4 3V2.5A1.5 1.5 0 015.5 1h4A1.5 1.5 0 0111 2.5v4A1.5 1.5 0 019.5 8H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Copy invite link
        </>
      )}
    </button>
  )
}
