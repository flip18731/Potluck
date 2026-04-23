"use client"

import { useInterwovenKit } from "@initia/interwovenkit-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChefHat, Users, Zap, Globe, Shield, ArrowRight, CheckCircle } from "lucide-react"

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
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <ChefHat className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-zinc-900">Potluck</span>
        </div>
        <div className="flex items-center gap-3">
          {address ? (
            <Button onClick={() => router.push("/dashboard")} size="sm">
              Open dashboard
            </Button>
          ) : (
            <Button onClick={openConnect} size="sm" variant="outline">
              Connect account
            </Button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-20 pb-16 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-medium px-3 py-1 rounded-full mb-6 border border-emerald-200">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Live on Initia Testnet
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-zinc-900 leading-tight mb-6">
          Share trips.{" "}
          <span className="text-emerald-600">Split fairly.</span>
          <br />
          Settle instantly.
        </h1>
        <p className="text-xl text-zinc-600 max-w-2xl mx-auto mb-4 leading-relaxed">
          Potluck is how friends handle group money — without the awkward Venmo requests,
          IBAN-sharing, or "hey you still owe me €12" texts.
        </p>
        <p className="text-base text-zinc-500 max-w-xl mx-auto mb-10">
          Everyone brings something to the table. At the end, everyone takes home what&apos;s theirs.
          Real on-chain settlement on Initia — your balance is queryable on InitiaScan.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" onClick={handleCTA} className="text-base px-8">
            Set the table
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push("/dashboard")}>
            View example potluck
          </Button>
        </div>
      </section>

      {/* Before / After comparison */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-center text-zinc-900 mb-8">The broken two-app workflow, fixed</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="font-semibold text-red-700 mb-4">Before Potluck</p>
            <ol className="space-y-3 text-sm text-red-700">
              {[
                "Create Splitwise group",
                "Log expenses manually",
                "Calculate who owes what",
                "Chase everyone on Venmo",
                "Wait days for bank transfer",
                "\"Hey, did you get my PayPal?\"",
                "Still unresolved 3 weeks later",
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-200 text-red-800 text-xs flex items-center justify-center font-bold">{i+1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
            <p className="font-semibold text-emerald-700 mb-4">With Potluck</p>
            <ol className="space-y-3 text-sm text-emerald-700">
              {[
                "Set the table (create potluck)",
                "Invite friends by @username.init",
                "Everyone brings their share",
                "Add expenses as they happen",
                "Plate passes automatically",
                "Clear the table — everyone settled",
                "Take leftovers home to any chain",
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle className="flex-shrink-0 h-5 w-5 text-emerald-600" />
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-center text-zinc-900 mb-10">Why Potluck works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              title: "Trustless escrow",
              desc: "Funds live on-chain, not in anyone's bank account. The potluck creator can't unilaterally take funds.",
            },
            {
              icon: Zap,
              title: "Instant settlement",
              desc: "When the table is cleared, everyone's share lands in their account in seconds — not days.",
            },
            {
              icon: Globe,
              title: "Works across borders",
              desc: "Your Brazilian friend can take their leftovers home to their chain. No IBAN, no FX fees, no Venmo.",
            },
            {
              icon: Users,
              title: "Identity-first",
              desc: "Add friends by @username.init — no address pasting, no QR scanning. Just names.",
            },
            {
              icon: ChefHat,
              title: "One-tap approval",
              desc: "Enable auto-sign once per potluck. Approve expenses without signature popups.",
            },
            {
              icon: ArrowRight,
              title: "Real transactions",
              desc: "Every contribution, reimbursement, and settlement is a real on-chain tx. Verifiable on InitiaScan.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white border border-zinc-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-zinc-900 mb-2">{title}</h3>
              <p className="text-sm text-zinc-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h2 className="text-2xl font-bold text-zinc-900 mb-4">Perfect for</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {["Ski trips", "Roommates", "Dinner clubs", "Wedding parties", "Hackathon teams", "Travel groups", "Road trips"].map((use) => (
            <span key={use} className="bg-zinc-100 text-zinc-700 px-4 py-2 rounded-full text-sm font-medium">
              {use}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-xl mx-auto px-6 py-16 text-center">
        <div className="bg-emerald-600 rounded-2xl p-10 text-white">
          <h2 className="text-3xl font-bold mb-3">Ready to set the table?</h2>
          <p className="text-emerald-100 mb-8">
            Sign in with Google. No wallet setup, no seed phrases. Your embedded Initia account is created automatically.
          </p>
          <Button
            size="lg"
            onClick={handleCTA}
            className="bg-white text-emerald-700 hover:bg-emerald-50 text-base px-8"
          >
            Get started — it&apos;s free
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-xs text-emerald-200 mt-4">
            Using Initia testnet • Get test tokens from{" "}
            <a href="https://faucet.testnet.initia.xyz" target="_blank" rel="noopener noreferrer" className="underline">faucet.testnet.initia.xyz</a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8 px-6 text-center text-sm text-zinc-500">
        <p>Built on <strong>Initia</strong> testnet • Verified on{" "}
          <a href="https://scan.testnet.initia.xyz" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">InitiaScan</a>
          {" "}• Powered by Interwoven Bridge
        </p>
      </footer>
    </div>
  )
}
