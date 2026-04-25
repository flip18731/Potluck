"use client"

import { useInterwovenKit } from "@initia/interwovenkit-react"
import { useRouter } from "next/navigation"
import { CTABtn } from "@/components/ui/CTABtn"

export function LandingPage() {
  const { address, openConnect } = useInterwovenKit()
  const router = useRouter()

  const handleCTA = () => {
    if (address) {
      router.push("/dashboard")
    } else {
      openConnect()
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F5F0", fontFamily: "inherit" }}>

      {/* Nav */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "#F8F5F0",
          borderBottom: "1px solid #EDE8E1",
          height: 56,
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            padding: "0 48px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 17,
              fontWeight: 640,
              color: "#1C1917",
              letterSpacing: "-0.025em",
            }}
          >
            Potluck
          </span>
          <CTABtn size="sm" onClick={handleCTA}>
            Start a potluck →
          </CTABtn>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "88px 48px 100px", maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ maxWidth: 660 }}>
          <h1
            style={{
              fontSize: 56,
              fontWeight: 640,
              letterSpacing: "-0.035em",
              color: "#1C1917",
              lineHeight: 1.06,
              margin: "0 0 24px",
              whiteSpace: "pre-line",
            }}
          >
            {"Everyone brings\nsomething. Nobody\nhas to ask."}
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "#78716C",
              lineHeight: 1.68,
              margin: "0 0 36px",
              maxWidth: 510,
            }}
          >
            Potluck is a shared pot for group expenses. Everyone chips in upfront, costs come out as
            the trip happens, and at the end whatever&apos;s left goes back to everyone — automatically.
          </p>
          <div style={{ display: "flex", flexDirection: "row", gap: 20, alignItems: "center" }}>
            <CTABtn size="lg" onClick={handleCTA}>
              Start a potluck →
            </CTABtn>
            <span style={{ fontSize: 13, color: "#A8A29E" }}>Sign in with Google. Free for groups.</span>
          </div>
        </div>
      </section>

      {/* Problem section */}
      <section style={{ backgroundColor: "#FFFFFF", padding: "68px 48px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 20,
              color: "#4A3D35",
              lineHeight: 1.65,
              fontWeight: 400,
              margin: 0,
            }}
          >
            One person booked the Airbnb. Someone else got groceries. A third handled lift tickets
            across the week. By Sunday night, nobody knows who owes whom how much. Two months later,
            three people still haven&apos;t been paid back.
          </p>
          <p
            style={{
              fontSize: 16,
              color: "#78716C",
              lineHeight: 1.68,
              marginTop: 22,
              marginBottom: 0,
            }}
          >
            This is the pattern Potluck is designed to end — not by tracking who owes what, but by
            settling it automatically when the trip closes.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section style={{ backgroundColor: "#F8F5F0", padding: "72px 48px 80px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 11.5,
              color: "#A8A29E",
              fontWeight: 550,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              marginBottom: 52,
              marginTop: 0,
            }}
          >
            How it works
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 52,
            }}
          >
            {[
              {
                num: "01",
                title: "Set the table",
                body: "Create a potluck, name it, invite your group. Everyone puts their expected share into the shared pot. The money belongs to the group — no single person holds it.",
              },
              {
                num: "02",
                title: "Add to the spread",
                body: "As expenses happen, log them. The pot pays out automatically, or reimburses whoever fronted the cash. Balances update in real time for everyone in the group.",
              },
              {
                num: "03",
                title: "Clear the table",
                body: "When the trip's over, one action distributes what's left back to everyone. No invoices, no follow-up texts, no spreadsheet. Cleared.",
              },
            ].map(({ num, title, body }) => (
              <div key={num}>
                <div
                  style={{
                    fontSize: 38,
                    fontWeight: 300,
                    color: "#DDD6CE",
                    fontVariantNumeric: "tabular-nums",
                    marginBottom: 18,
                  }}
                >
                  {num}
                </div>
                <div
                  style={{
                    fontSize: 15.5,
                    fontWeight: 580,
                    color: "#1C1917",
                    marginBottom: 10,
                  }}
                >
                  {title}
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: "#78716C",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section style={{ backgroundColor: "#FFFFFF", padding: "36px 48px" }}>
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "flex",
            flexDirection: "row",
            alignItems: "stretch",
          }}
        >
          {[
            "Real money, settled instantly.",
            "Every balance visible to all members.",
            "No single person holds the group's pot.",
          ].map((text, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                borderLeft: i > 0 ? "1px solid #EDE8E1" : undefined,
                paddingLeft: i > 0 ? 32 : 0,
                paddingRight: i < 2 ? 32 : 0,
                fontSize: 13.5,
                color: "#78716C",
                lineHeight: 1.5,
              }}
            >
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* Second CTA */}
      <section style={{ backgroundColor: "#FDF3E8", padding: "80px 48px", textAlign: "center" }}>
        <h2
          style={{
            fontSize: 34,
            fontWeight: 640,
            letterSpacing: "-0.025em",
            color: "#1C1917",
            margin: "0 0 14px",
          }}
        >
          Your next trip deserves this.
        </h2>
        <p style={{ fontSize: 16, color: "#78716C", margin: "0 0 34px" }}>
          Set up a potluck in about thirty seconds.
        </p>
        <CTABtn size="lg" onClick={handleCTA}>
          Start a potluck →
        </CTABtn>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: "#1C1917", padding: "44px 48px 36px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          {/* Top row */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 20,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 640,
                  color: "#F8F5F0",
                  letterSpacing: "-0.02em",
                  marginBottom: 6,
                }}
              >
                Potluck
              </div>
              <p style={{ fontSize: 13, color: "#4A4440", margin: 0 }}>
                The shared pot for group expenses.
              </p>
            </div>
            <div style={{ display: "flex", gap: 28 }}>
              {["Terms", "Privacy", "Contact"].map((link) => (
                <FooterLink key={link}>{link}</FooterLink>
              ))}
            </div>
          </div>

          {/* Bottom row */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 12, color: "#3A3030" }}>© 2026 Potluck</span>
            <span style={{ fontSize: 12, color: "#3A3030" }}>Built on Initia</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FooterLink({ children }: { children: string }) {
  return (
    <a
      href="#"
      style={{ fontSize: 13, color: "#5A5050", textDecoration: "none", transition: "color 0.15s" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#A8A29E")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#5A5050")}
    >
      {children}
    </a>
  )
}
