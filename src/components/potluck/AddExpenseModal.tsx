"use client"

import { useState, useEffect } from "react"
import { useInterwovenKit } from "@initia/interwovenkit-react"
import { Avatar } from "@/components/ui/Avatar"
import { CTABtn } from "@/components/ui/CTABtn"
import { toast } from "sonner"
import { toMicro, fromMicro } from "@/lib/initia/chain"
import { formatIdentity } from "@/lib/initia/username"
import { HEARTH } from "@/lib/design/tokens"

interface Member {
  address: string
  username: string | null
}

interface AddExpenseModalProps {
  poolId: string
  members: Member[]
  denom: string
  onSuccess: () => void
  trigger?: React.ReactNode
}

export function AddExpenseModal({ poolId, members, denom, onSuccess, trigger }: AddExpenseModalProps) {
  const { address } = useInterwovenKit()
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [paidByAddress, setPaidByAddress] = useState(address || members[0]?.address || "")
  const [splitBetween, setSplitBetween] = useState<string[]>(members.map((m) => m.address))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  const toggleSplit = (addr: string) => {
    setSplitBetween((prev) =>
      prev.includes(addr) ? prev.filter((a) => a !== addr) : [...prev, addr]
    )
  }

  const handleSubmit = async () => {
    if (!description.trim()) { toast.error("Add a description"); return }
    if (!amount || parseFloat(amount) <= 0) { toast.error("Enter a valid amount"); return }
    if (splitBetween.length === 0) { toast.error("Select at least one person to split between"); return }
    if (!paidByAddress) { toast.error("Select who paid"); return }

    setLoading(true)
    try {
      const amountMicro = toMicro(amount).toString()
      const paidByMember = members.find((m) => m.address === paidByAddress)

      const res = await fetch(`/api/pools/${poolId}/expense`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          amount: amountMicro,
          paidByAddress,
          paidByUsername: paidByMember?.username ?? null,
          splitBetween,
          reimbursedFromPool: true,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to add expense")

      const paidByDisplay = formatIdentity(paidByAddress, paidByMember?.username ?? null)
      toast.success(`Passing the plate to ${paidByDisplay}`, {
        description: `${description}: ${amount} INIT`,
      })

      setDescription("")
      setAmount("")
      setOpen(false)
      onSuccess()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const perSplit = amount && splitBetween.length > 0
    ? fromMicro((toMicro(amount) / BigInt(splitBetween.length)).toString())
    : null

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
                  The treasury will send {amount || "0"} INIT to{" "}
                  <strong style={{ color: "#4A3D35" }}>
                    {formatIdentity(paidByAddress, members.find(m => m.address === paidByAddress)?.username ?? null)}
                  </strong>{" "}
                  automatically.
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
