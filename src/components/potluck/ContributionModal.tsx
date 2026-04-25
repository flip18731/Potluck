"use client"

import { useState, useEffect, useRef } from "react"
import { useInterwovenKit } from "@initia/interwovenkit-react"
import { CTABtn } from "@/components/ui/CTABtn"
import { toast } from "sonner"
import { parseMicroAmount, fromMicro, INITIA_TESTNET } from "@/lib/initia/chain"
import { isAutoSignEnabled } from "@/lib/initia/autosign"
import { HEARTH } from "@/lib/design/tokens"

interface ContributionModalProps {
  poolId: string
  poolName: string
  denom: string
  onSuccess: () => void
  trigger?: React.ReactNode
}

export function ContributionModal({ poolId, poolName, denom, onSuccess, trigger }: ContributionModalProps) {
  const { address, username, requestTxBlock } = useInterwovenKit()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [lastContributionMicro, setLastContributionMicro] = useState<bigint | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const treasuryAddress = process.env.NEXT_PUBLIC_TREASURY_ADDRESS
  const amountMicro = parseMicroAmount(amount)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("keydown", onKey)
    setTimeout(() => inputRef.current?.focus(), 50)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  const handleContribute = async () => {
    if (!address) { toast.error("Connect your account first"); return }
    if (!amountMicro || amountMicro <= 0n) { toast.error("Enter a valid amount"); return }
    if (!treasuryAddress) { toast.error("Pool account not configured"); return }

    setLoading(true)
    try {
      const amountMicroStr = amountMicro.toString()

      const { transactionHash } = await requestTxBlock({
        messages: [
          {
            typeUrl: "/cosmos.bank.v1beta1.MsgSend",
            value: {
              fromAddress: address,
              toAddress: treasuryAddress,
              amount: [{ denom: denom || "uinit", amount: amountMicroStr }],
            },
          },
        ],
      })

      await fetch(`/api/pools/${poolId}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberAddress: address,
          memberUsername: username || null,
          amount: amountMicroStr,
          txHash: transactionHash,
        }),
      })

      setLastContributionMicro(amountMicro)
      toast.success(`Brought ${fromMicro(amountMicro)} INIT to the table!`, {
        description: `Tx: ${transactionHash.slice(0, 20)}…`,
        action: {
          label: "View",
          onClick: () => window.open(`${INITIA_TESTNET.explorerUrl}/txs/${transactionHash}`, "_blank"),
        },
      })
      setAmount("")
      setOpen(false)
      onSuccess()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Transaction failed")
    } finally {
      setLoading(false)
    }
  }

  const autoSign = isAutoSignEnabled(poolId)

  return (
    <>
      <div onClick={() => setOpen(true)} style={{ display: "contents" }}>
        {trigger}
      </div>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(28,25,23,0.4)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2D9CE",
              borderRadius: 12,
              width: "100%",
              maxWidth: 400,
              overflow: "hidden",
            }}
          >
            {/* Hearth accent bar */}
            <div style={{ height: 3, backgroundColor: HEARTH }} />

            <div style={{ padding: "22px 24px 26px" }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 10.5, fontWeight: 620, letterSpacing: "0.08em", textTransform: "uppercase", color: "#78716C" }}>
                  Bring your share
                </div>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#C4BAB0",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#78716C")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#C4BAB0")}
                  aria-label="Close"
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M2.5 2.5l10 10M12.5 2.5l-10 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              <p style={{ fontSize: 13, color: "#A8A29E", marginBottom: 18 }}>
                Contributing to <strong style={{ color: "#78716C" }}>{poolName}</strong>.
                Everyone can see updates as soon as your contribution is confirmed.
              </p>

              {/* Amount input */}
              <label style={{ fontSize: 11.5, color: "#A8A29E", display: "block", marginBottom: 6 }}>
                Amount
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #DDD6CE",
                  borderRadius: 6,
                  overflow: "hidden",
                  marginBottom: 10,
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onClick={() => inputRef.current?.focus()}
              >
                <span className="tabular" style={{ padding: "0 6px 0 12px", fontSize: 14, color: "#A8A29E", userSelect: "none", flexShrink: 0 }}>
                  INIT
                </span>
                <input
                  ref={inputRef}
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleContribute()}
                  className="tabular"
                  style={{
                    flex: 1,
                    padding: "10px 12px 10px 4px",
                    fontSize: 16,
                    fontWeight: 550,
                    color: "#1C1917",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    width: "100%",
                    fontFamily: "inherit",
                  }}
                  aria-label="Amount to bring"
                />
              </div>

              {autoSign && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#C07A38", backgroundColor: "#FDF3E8", padding: "8px 12px", borderRadius: 6, marginBottom: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: HEARTH }} />
                  One-tap active — no popup needed
                </div>
              )}

              <CTABtn
                full
                onClick={handleContribute}
                disabled={loading || !amountMicro || amountMicro <= 0n}
              >
                {loading
                  ? "Sending…"
                  : `Bring ${amountMicro && amountMicro > 0n ? fromMicro(amountMicro) : "0"} INIT to the pot`}
              </CTABtn>

              <p style={{ textAlign: "center", fontSize: 11.5, color: "#C4BAB0", marginTop: 10 }}>
                {lastContributionMicro && lastContributionMicro > 0n
                  ? `${fromMicro(lastContributionMicro)} INIT on its way`
                  : "Visible to all members"}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
