"use client"

import { useInterwovenKit } from "@initia/interwovenkit-react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AppNav } from "@/components/chrome/AppNav"
import { CTABtn } from "@/components/ui/CTABtn"
import { Avatar } from "@/components/ui/Avatar"

interface MemberEntry {
  input: string
  address: string | null
  username: string | null
  resolving: boolean
  error: string | null
}

export default function NewPotluckPage() {
  const { address, username } = useInterwovenKit()
  const router = useRouter()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [endDate, setEndDate] = useState("")
  const [memberInput, setMemberInput] = useState("")
  const [members, setMembers] = useState<MemberEntry[]>([])
  const [creating, setCreating] = useState(false)
  const [memberAreaFocused, setMemberAreaFocused] = useState(false)
  const memberInputRef = useRef<HTMLInputElement>(null)

  const resolveAndAdd = async () => {
    if (!memberInput.trim()) return
    const input = memberInput.trim()

    const entry: MemberEntry = { input, address: null, username: null, resolving: true, error: null }
    setMembers((prev) => [...prev, entry])
    setMemberInput("")

    try {
      const res = await fetch(`/api/username/resolve?name=${encodeURIComponent(input)}`)
      if (!res.ok) {
        setMembers((prev) =>
          prev.map((m) =>
            m.input === input ? { ...m, resolving: false, error: "Username not found. They can claim at usernames.testnet.initia.xyz" } : m
          )
        )
        return
      }
      const data = await res.json()
      setMembers((prev) =>
        prev.map((m) =>
          m.input === input
            ? { ...m, address: data.address, username: data.username, resolving: false }
            : m
        )
      )
    } catch {
      setMembers((prev) =>
        prev.map((m) =>
          m.input === input ? { ...m, resolving: false, error: "Could not resolve username" } : m
        )
      )
    }
  }

  const removeMember = (input: string) => {
    setMembers((prev) => prev.filter((m) => m.input !== input))
  }

  const handleCreate = async () => {
    if (!name.trim()) { toast.error("Give your potluck a name"); return }
    if (!address) { toast.error("Connect your account first"); return }

    const resolvedMembers = members.filter((m) => m.address)
    setCreating(true)
    try {
      const res = await fetch("/api/pools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          creatorAddress: address,
          creatorUsername: username || null,
          members: resolvedMembers.map((m) => ({ address: m.address!, username: m.username })),
          denom: "uinit",
          endDate: endDate || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to create potluck")
      }
      const pool = await res.json()
      toast.success("Table is set! Welcome to your potluck.")
      router.push(`/p/${pool.id}`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setCreating(false)
    }
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 12.5,
    color: "#78716C",
    fontWeight: 500,
    display: "block",
    marginBottom: 7,
  }

  const optionalBadgeStyle: React.CSSProperties = {
    fontSize: 11.5,
    color: "#C4BAB0",
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #DDD6CE",
    borderRadius: 6,
    fontSize: 14,
    color: "#1C1917",
    backgroundColor: "#FFFFFF",
    fontFamily: "inherit",
    boxSizing: "border-box",
    outline: "none",
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F5F0" }}>
      <AppNav backLabel="Dashboard" backHref="/dashboard" />

      <main style={{ maxWidth: 560, margin: "0 auto", padding: "48px 32px 64px" }}>
        <h1
          style={{
            fontSize: 25,
            fontWeight: 640,
            letterSpacing: "-0.025em",
            color: "#1C1917",
            marginBottom: 6,
            margin: "0 0 6px",
          }}
        >
          Set the table
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "#A8A29E",
            marginBottom: 36,
            margin: "0 0 36px",
          }}
        >
          Give your potluck a name and invite your group.
        </p>

        {/* Form fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 32 }}>

          {/* Name */}
          <div>
            <label style={labelStyle}>Name</label>
            <input
              className="field-input"
              style={inputStyle}
              placeholder="Ski Trip 2026, Barcelona August, …"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 7 }}>
              <span style={labelStyle}>Description</span>
              <span style={optionalBadgeStyle}>Optional</span>
            </div>
            <input
              className="field-input"
              style={inputStyle}
              placeholder="A few words about the trip"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* End date */}
          <div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 7 }}>
              <span style={labelStyle}>End date</span>
              <span style={optionalBadgeStyle}>Optional</span>
            </div>
            <input
              className="field-input"
              type="date"
              style={inputStyle}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Invite members */}
          <div>
            <label style={labelStyle}>Invite members</label>

            {/* Member chip input area */}
            <div
              onClick={() => memberInputRef.current?.focus()}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                border: `1px solid ${memberAreaFocused ? "#C07A38" : "#DDD6CE"}`,
                borderRadius: 7,
                padding: "7px 10px",
                backgroundColor: "#FFFFFF",
                minHeight: 48,
                cursor: "text",
                transition: "border-color 0.15s",
                alignItems: "center",
              }}
            >
              {/* Resolved / resolving / error chips */}
              {members.map((m) => {
                if (m.resolving) {
                  return (
                    <div
                      key={m.input}
                      style={{
                        backgroundColor: "#F5F0EA",
                        borderRadius: 20,
                        padding: "3px 8px",
                        fontSize: 13,
                        color: "#A8A29E",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      Resolving…
                      <button
                        onClick={(e) => { e.stopPropagation(); removeMember(m.input) }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#A8A29E",
                          cursor: "pointer",
                          fontSize: 15,
                          lineHeight: 1,
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )
                }
                if (m.error) {
                  return (
                    <div
                      key={m.input}
                      style={{
                        backgroundColor: "#FEF2F2",
                        borderRadius: 20,
                        padding: "3px 8px",
                        fontSize: 13,
                        color: "#DC2626",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      {m.input} — not found
                      <button
                        onClick={(e) => { e.stopPropagation(); removeMember(m.input) }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#DC2626",
                          cursor: "pointer",
                          fontSize: 15,
                          lineHeight: 1,
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )
                }
                // resolved
                const handle = m.username || m.input
                return (
                  <div
                    key={m.input}
                    style={{
                      backgroundColor: "#F5F0EA",
                      borderRadius: 20,
                      padding: "3px 8px",
                      fontSize: 13,
                      color: "#5A4A3A",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Avatar handle={handle} size={18} />
                    @{handle}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeMember(m.input) }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#A8A29E",
                        cursor: "pointer",
                        fontSize: 15,
                        lineHeight: 1,
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      ×
                    </button>
                  </div>
                )
              })}

              {/* Inline text input with @ prefix */}
              <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 100 }}>
                <span style={{ fontSize: 13, color: "#C4BAB0", userSelect: "none" }}>@</span>
                <input
                  ref={memberInputRef}
                  style={{
                    flex: 1,
                    fontSize: 13.5,
                    border: "none",
                    outline: "none",
                    backgroundColor: "transparent",
                    fontFamily: "inherit",
                    color: "#1C1917",
                    minWidth: 80,
                  }}
                  placeholder="handle.init"
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  onFocus={() => setMemberAreaFocused(true)}
                  onBlur={() => setMemberAreaFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      resolveAndAdd()
                    }
                  }}
                />
              </div>
            </div>

            <p style={{ fontSize: 12, color: "#A8A29E", marginTop: 6, margin: "6px 0 0" }}>
              Type a handle and press Enter to add.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: "#EDE8E1", marginBottom: 24 }} />

        {/* Submit */}
        <CTABtn
          full
          size="md"
          disabled={creating || !name.trim()}
          onClick={handleCreate}
        >
          {creating ? "Setting the table…" : "Set the table →"}
        </CTABtn>
      </main>
    </div>
  )
}
