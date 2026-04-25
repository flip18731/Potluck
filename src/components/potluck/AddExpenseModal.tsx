"use client"

import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useInterwovenKit } from "@initia/interwovenkit-react"
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx"
import { Avatar } from "@/components/ui/Avatar"
import { CTABtn } from "@/components/ui/CTABtn"
import { toast } from "sonner"
import { parseMicroAmount, fromMicro, UINIT_DENOM } from "@/lib/initia/chain"
import { formatIdentity } from "@/lib/initia/username"
import { HEARTH } from "@/lib/design/tokens"
import { humanizeTxError } from "@/lib/initia/tx-errors"

interface Member {
  address: string
  username: string | null
}

interface AddExpenseModalProps {
  poolId: string
  members: Member[]
  onSuccess: () => void
  trigger?: React.ReactNode
}

export function AddExpenseModal({ poolId, members, onSuccess, trigger }: AddExpenseModalProps) {
  const queryClient = useQueryClient()
  const { address, requestTxBlock } = useInterwovenKit()
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [paidByAddress, setPaidByAddress] = useState(address || members[0]?.address || "")
  const [splitBetween, setSplitBetween] = useState<string[]>(members.map((m) => m.address))
  const [loading, setLoading] = useState(false)
  const amountMicro = parseMicroAmount(amount)
  const transferTarget = process.env.NEXT_PUBLIC_POOL_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_TREASURY_ADDRESS
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  const openModal = () => {
    if (members.length > 0) {
      setSplitBetween(members.map((m) => m.address))
      setPaidByAddress((prev) =>
        members.some((m) => m.address === prev) ? prev : (address || members[0]?.address || "")
      )
    }
    setOpen(true)
  }

  const toggleSplit = (addr: string) => {
    setSplitBetween((prev) =>
      prev.includes(addr) ? prev.filter((a) => a !== addr) : [...prev, addr]
    )
  }

  const handleSubmit = async () => {
    if (!address) { toast.error("Connect your account first"); return }
    if (!description.trim()) { toast.error("Add a description"); return }
    if (!amountMicro || amountMicro <= 0n) { toast.error("Enter a valid amount"); return }
    if (splitBetween.length === 0) { toast.error("Select at least one person to split between"); return }
    if (!paidByAddress) { toast.error("Select who paid"); return }
    if (!transferTarget) { toast.error("Pool destination not configured"); return }
    if (paidByAddress !== address) {
      toast.error("Only the paying member can submit this expense")
      return
    }

    setLoading(true)
    try {
      const amountMicroStr = amountMicro.toString()
      const paidByMember = members.find((m) => m.address === paidByAddress)

      const { transactionHash } = await requestTxBlock({
        messages: [
          {
            typeUrl: "/cosmos.bank.v1beta1.MsgSend",
            value: MsgSend.fromPartial({
              fromAddress: address,
              toAddress: transferTarget,
              amount: [{ denom: UINIT_DENOM, amount: amountMicroStr }],
            }),
          },
        ],
      })

      const res = await fetch(`/api/pools/${poolId}/expense`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          amount: amountMicroStr,
          paidByAddress,
          paidByUsername: paidByMember?.username ?? null,
          splitBetween,
          reimbursedFromPool: true,
          txHash: transactionHash,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(typeof data?.error === "string" ? data.error : "Failed to add expense")

      await queryClient.invalidateQueries({ queryKey: ["pool", poolId] })
      await queryClient.invalidateQueries({ queryKey: ["onchain-uinit-balance"] })

      const paidByDisplay = formatIdentity(paidByAddress, paidByMember?.username ?? null)
      toast.success(`Passing the plate to ${paidByDisplay}`, {
        description: `${description}: ${fromMicro(amountMicro)} INIT`,
      })

      setDescription("")
      setAmount("")
      setOpen(false)
      onSuccess()
    } catch (e: unknown) {
      toast.error(humanizeTxError(e))
    } finally {
      setLoading(false)
    }
  }

  const perSplit = amountMicro && splitBetween.length > 0
    ? fromMicro((amountMicro / BigInt(splitBetween.length)).toString())
    : null

  return (
    <>
      <div onClick={openModal} style={{ display: "contents" }}>
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
              maxWidth: 440,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 580, color: "#1C1917", letterSpacing: "-0.01em" }}>
                Add to the spread
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
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Description */}
              <div>
                <label style={{ fontSize: 11.5, color: "#A8A29E", display: "block", marginBottom: 6 }}>
                  What was it for?
                </label>
                <input
                  type="text"
                  placeholder="Dinner, Airbnb, Groceries…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="field-input"
                  style={{ width: "100%", padding: "10px 12px", fontSize: 14, borderRadius: 6, border: "1px solid #DDD6CE", color: "#1C1917", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = HEARTH; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(192,122,56,0.12)" }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#DDD6CE"; e.currentTarget.style.boxShadow = "none" }}
                />
              </div>

              {/* Amount */}
              <div>
                <label style={{ fontSize: 11.5, color: "#A8A29E", display: "block", marginBottom: 6 }}>
                  Amount (INIT)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="tabular field-input"
                  style={{ width: "100%", padding: "10px 12px", fontSize: 15, fontWeight: 550, borderRadius: 6, border: "1px solid #DDD6CE", color: "#1C1917", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = HEARTH; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(192,122,56,0.12)" }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#DDD6CE"; e.currentTarget.style.boxShadow = "none" }}
                />
              </div>

              {/* Who paid */}
              <div>
                <label style={{ fontSize: 11.5, color: "#A8A29E", display: "block", marginBottom: 8 }}>
                  Who paid?
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {members.map((m) => {
                    const handle = m.username || m.address.slice(0, 8)
                    const selected = paidByAddress === m.address
                    return (
                      <label
                        key={m.address}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          borderRadius: 7,
                          border: `1px solid ${selected ? HEARTH : "#E2D9CE"}`,
                          backgroundColor: selected ? "#FDF3E8" : "#FFFFFF",
                          cursor: "pointer",
                          transition: "border-color 0.15s, background-color 0.15s",
                        }}
                      >
                        <input
                          type="radio"
                          name="paidBy"
                          value={m.address}
                          checked={selected}
                          onChange={() => setPaidByAddress(m.address)}
                          style={{ accentColor: HEARTH }}
                        />
                        <Avatar handle={handle} displayName={m.username || undefined} size={22} />
                        <span style={{ fontSize: 13, color: "#1C1917", flex: 1 }}>{m.username || handle}</span>
                        {m.address === address && (
                          <span style={{ fontSize: 11, color: "#A8A29E" }}>you</span>
                        )}
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Split between */}
              <div>
                <label style={{ fontSize: 11.5, color: "#A8A29E", display: "block", marginBottom: 8 }}>
                  Split between
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {members.map((m) => {
                    const handle = m.username || m.address.slice(0, 8)
                    const checked = splitBetween.includes(m.address)
                    return (
                      <label
                        key={m.address}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          borderRadius: 7,
                          border: `1px solid ${checked ? HEARTH : "#E2D9CE"}`,
                          backgroundColor: checked ? "#FDF3E8" : "#FFFFFF",
                          cursor: "pointer",
                          transition: "border-color 0.15s, background-color 0.15s",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSplit(m.address)}
                          style={{ accentColor: HEARTH }}
                        />
                        <Avatar handle={handle} displayName={m.username || undefined} size={22} />
                        <span style={{ fontSize: 13, color: "#1C1917", flex: 1 }}>{m.username || handle}</span>
                        {checked && perSplit && (
                          <span className="tabular" style={{ fontSize: 12, color: "#A8A29E" }}>
                            {perSplit} INIT
                          </span>
                        )}
                      </label>
                    )
                  })}
                </div>
                <p style={{ fontSize: 12, color: "#C4BAB0", marginTop: 6 }}>Split equally among selected</p>
              </div>

              {/* Info note */}
              <div style={{ backgroundColor: "#FDF3E8", border: "1px solid #F0E0C8", borderRadius: 7, padding: "10px 12px" }}>
                <p style={{ fontSize: 12, color: "#78716C", margin: 0, lineHeight: 1.5 }}>
                  This expense sends {amountMicro ? fromMicro(amountMicro) : "0"} INIT and logs the reimbursement instantly for the group.
                  {" "}
                  <strong style={{ color: "#4A3D35" }}>
                    {formatIdentity(paidByAddress, members.find(m => m.address === paidByAddress)?.username ?? null)}
                  </strong>{" "}
                  is marked as the payer.
                </p>
              </div>

              <CTABtn full onClick={handleSubmit} disabled={loading}>
                {loading ? "Adding…" : "Add to the spread"}
              </CTABtn>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
