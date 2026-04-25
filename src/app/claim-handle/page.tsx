"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useInterwovenKit } from "@initia/interwovenkit-react"
import { AppNav } from "@/components/chrome/AppNav"
import { CTABtn } from "@/components/ui/CTABtn"
import { HEARTH } from "@/lib/design/tokens"

type Status = "idle" | "checking" | "available" | "taken"

export default function ClaimHandlePage() {
  const router = useRouter()
  const { requestTxBlock } = useInterwovenKit()
  const [handle, setHandle] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [claiming, setClaiming] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const trimmed = handle.trim()
    if (!trimmed) {
      setStatus("idle")
      return
    }

    setStatus("checking")
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/username/resolve?name=${encodeURIComponent(trimmed + ".init")}`)
        if (res.ok) {
          // Resolved to an address → taken
          setStatus("taken")
        } else if (res.status === 404) {
          setStatus("available")
        } else {
          setStatus("idle")
        }
      } catch {
        setStatus("idle")
      }
    }, 650)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [handle])

  const handleClaim = async () => {
    const registryAddress = process.env.NEXT_PUBLIC_USERNAME_REGISTRY_ADDRESS
    if (!registryAddress) {
      router.push("/dashboard")
      return
    }

    setClaiming(true)
    try {
      await requestTxBlock({
        messages: [
          {
            typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
            value: {
              contract: registryAddress,
              msg: Buffer.from(
                JSON.stringify({ claim: { name: handle.trim() } })
              ).toString("base64"),
              funds: [],
            },
          },
        ],
      })
      router.push("/dashboard")
    } catch (err) {
      console.error("Claim failed:", err)
    } finally {
      setClaiming(false)
    }
  }

  const inputBorderColor =
    status === "available"
      ? HEARTH
      : status === "taken"
      ? "#DDD6CE"
      : "#DDD6CE"

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8F5F0",
        display: "flex",
        flexDirection: "column",
        fontFamily: "inherit",
      }}
    >
      <AppNav backLabel="" />

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 16px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400, padding: 32 }}>
          {/* Eyebrow */}
          <p
            style={{
              fontSize: 12,
              color: "#A8A29E",
              fontWeight: 450,
              textAlign: "center",
              marginBottom: 10,
              marginTop: 0,
            }}
          >
            Almost there
          </p>

          {/* Heading */}
          <h1
            style={{
              fontSize: 25,
              fontWeight: 640,
              letterSpacing: "-0.025em",
              textAlign: "center",
              color: "#1C1917",
              marginBottom: 8,
              marginTop: 0,
            }}
          >
            What should we call you?
          </h1>

          {/* Subheading */}
          <p
            style={{
              fontSize: 14,
              color: "#A8A29E",
              textAlign: "center",
              marginBottom: 36,
              marginTop: 0,
              lineHeight: 1.6,
            }}
          >
            Pick a handle. This is how others find and invite you to potlucks.
          </p>

          {/* Handle input row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: `1px solid ${inputBorderColor}`,
              borderRadius: 7,
              backgroundColor: "#FFFFFF",
              overflow: "hidden",
              marginBottom: 8,
              transition: "border-color 0.15s",
            }}
          >
            <span
              style={{
                padding: "11px 2px 11px 14px",
                fontSize: 15,
                color: "#A8A29E",
                flexShrink: 0,
                userSelect: "none",
              }}
            >
              @
            </span>
            <input
              type="text"
              value={handle}
              onChange={(e) => {
                // only allow alphanumeric, hyphen, underscore
                const val = e.target.value.replace(/[^a-z0-9_-]/gi, "").toLowerCase()
                setHandle(val)
              }}
              placeholder="yourname"
              autoFocus
              style={{
                flex: 1,
                padding: "11px 0",
                fontSize: 15,
                fontWeight: 480,
                color: "#1C1917",
                border: "none",
                outline: "none",
                background: "transparent",
                fontFamily: "inherit",
                minWidth: 0,
              }}
            />
            <span
              style={{
                padding: "11px 14px 11px 2px",
                fontSize: 15,
                color: "#A8A29E",
                flexShrink: 0,
                userSelect: "none",
              }}
            >
              .init
            </span>
          </div>

          {/* Status line */}
          <div style={{ minHeight: 22, marginBottom: 22 }}>
            {status === "checking" && (
              <span style={{ fontSize: 12, color: "#A8A29E" }}>Checking…</span>
            )}
            {status === "available" && (
              <span style={{ fontSize: 12, color: HEARTH, fontWeight: 500 }}>
                @{handle}.init is available
              </span>
            )}
            {status === "taken" && (
              <span style={{ fontSize: 12, color: "#A8A29E" }}>
                That handle is taken — try another
              </span>
            )}
          </div>

          {/* CTA */}
          <CTABtn
            full
            disabled={status !== "available" || claiming}
            onClick={handleClaim}
          >
            {handle
              ? `Claim @${handle}.init →`
              : "Claim this handle"}
          </CTABtn>
        </div>
      </div>
    </div>
  )
}
