"use client"

import { useInterwovenKit } from "@initia/interwovenkit-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChefHat, Users, Zap, Globe, Shield, ArrowRight, CheckCircle, X } from "lucide-react"

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
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="flex items-center justify-between px-6 py-3.5 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm">
              <ChefHat className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} />
            </div>
            <span className="font-bold text-xl text-zinc-900 tracking-tight">Potluck</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://faucet.testnet.initia.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex text-sm text-zinc-500 hover:text-zinc-700 px-3 py-1.5 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              Get test tokens
            </a>
            {address ? (
              <Button onClick={() => router.push("/dashboard")} size="sm">
                Open dashboard →
              </Button>
            ) : (
              <Button onClick={openConnect} size="sm">
                Get started free
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-8 border border-emerald-200/60">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live on Initia Testnet · Real on-chain settlement
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-zinc-900 leading-[1.05] tracking-tight mb-6">
          Group money,{" "}
          <span className="relative">
            <span className="text-emerald-600">finally settled.</span>
            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-emerald-200 rounded-full" />
          </span>
        </h1>

        <p className="text-xl sm:text-2xl text-zinc-500 max-w-2xl mx-auto mb-4 leading-relaxed font-light">
          Everyone brings something to the table. At the end,{" "}
          <strong className="text-zinc-700 font-medium">everyone takes home what&apos;s theirs.</strong>
        </p>
        <p className="text-base text-zinc-400 max-w-xl mx-auto mb-10">
          No Venmo. No IBANs. No "hey you still owe me €12" texts.
          Real on-chain settlement on Initia — every transfer verifiable on InitiaScan.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button size="lg" onClick={handleCTA} className="text-base px-8 h-12 shadow-sm">
            Set the table
            <ArrowRight className="h-4 w-4" />
          </Button>
          <a
            href="https://scan.testnet.initia.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-500 hover:text-zinc-700 flex items-center gap-1.5"
          >
            Verify on InitiaScan →
          </a>
        </div>

        {/* Social proof chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-10">
          {["Ski trips", "Roommates", "Dinner clubs", "Travel groups", "Wedding parties"].map((use) => (
            <span key={use} className="text-xs text-zinc-400 bg-zinc-50 border border-zinc-100 px-3 py-1.5 rounded-full">
              {use}
            </span>
          ))}
        </div>
      </section>

      {/* Split comparison */}
      <section className="py-20 px-6 bg-zinc-50">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs text-zinc-400 uppercase tracking-widest font-semibold mb-10">
            The broken workflow, fixed
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Before */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-7 w-7 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="h-3.5 w-3.5 text-red-500" />
                </div>
                <p className="font-semibold text-zinc-500">Without Potluck</p>
              </div>
              <ol className="space-y-3">
                {[
                  "Log in to Splitwise, create a group",
                  "Add expenses one by one",
                  "Figure out who owes who",
                  "Chase everyone on Venmo / PayPal",
                  "Wait days for bank transfers to clear",
                  "\"Hey, did you get my request?\"",
                  "Still unresolved 3 weeks later 😬",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-500">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-100 text-zinc-400 text-xs flex items-center justify-center font-medium mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* After */}
            <div className="bg-emerald-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle className="h-3.5 w-3.5 text-white" />
                </div>
                <p className="font-semibold text-white/90">With Potluck</p>
              </div>
              <ol className="space-y-3">
                {[
                  "Set the table — one potluck, all members",
                  "Everyone brings their share on-chain",
                  "Add expenses as they happen",
                  "Plate passes automatically — payer reimbursed instantly",
                  "Real-time balance board for everyone",
                  "Clear the table — settled in seconds",
                  "Take leftovers home to any Initia chain 🎉",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-white/90">
                    <CheckCircle className="flex-shrink-0 h-4 w-4 text-emerald-200 mt-0.5" />
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <p className="text-center text-xs text-zinc-400 uppercase tracking-widest font-semibold mb-12">
          Built different
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: Shield,
              color: "bg-blue-50 text-blue-600",
              title: "Trustless escrow",
              desc: "Funds live on-chain. Nobody holds the bag — not even the creator. The rules are in code, not promises.",
            },
            {
              icon: Zap,
              color: "bg-amber-50 text-amber-600",
              title: "Instant settlement",
              desc: "When the table is cleared, everyone's share lands in their wallet in seconds. Not days, not after a PayPal review.",
            },
            {
              icon: Globe,
              color: "bg-purple-50 text-purple-600",
              title: "Works across borders",
              desc: "Your Brazilian friend takes their leftovers home to their chain. No IBAN, no SWIFT, no FX fees.",
            },
            {
              icon: Users,
              color: "bg-emerald-50 text-emerald-600",
              title: "Identity-first",
              desc: "Add members by @username.init. No address pasting, no QR scanning — just names your friends already have.",
            },
            {
              icon: ChefHat,
              color: "bg-rose-50 text-rose-600",
              title: "One-tap approval",
              desc: "Enable auto-sign once per potluck. Contribute and approve expenses without a signature popup every time.",
            },
            {
              icon: ArrowRight,
              color: "bg-zinc-100 text-zinc-600",
              title: "Fully verifiable",
              desc: "Every contribution, reimbursement, and settlement is a real on-chain tx with a link to InitiaScan.",
            },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="group bg-white rounded-xl p-5 border border-zinc-200 hover:border-zinc-300 hover:shadow-md transition-all">
              <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-zinc-900 mb-1.5">{title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — 3 steps */}
      <section className="py-20 px-6 bg-zinc-50">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold mb-12">
            Three steps
          </p>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Set the table", desc: "Create a potluck, invite friends by their .init username. They're ready the moment you share the link." },
              { step: "2", title: "Everyone brings a share", desc: "Members contribute funds on-chain. As expenses happen, the plate is passed automatically to whoever paid." },
              { step: "3", title: "Clear the table", desc: "One click settles everything. Remaining balance goes straight to each member's wallet. No chasing, no awkward texts." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4 shadow-sm">
                  {step}
                </div>
                <h3 className="font-semibold text-zinc-900 mb-2">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-lg mx-auto text-center">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-10 text-white shadow-xl">
            <ChefHat className="h-10 w-10 mx-auto mb-4 opacity-80" />
            <h2 className="text-3xl font-bold mb-3">Ready to set the table?</h2>
            <p className="text-emerald-100 mb-8 text-base leading-relaxed">
              Sign in with Google. No seed phrases. Your embedded Initia wallet is created in seconds.
            </p>
            <Button
              size="lg"
              onClick={handleCTA}
              className="bg-white text-emerald-700 hover:bg-emerald-50 text-base px-8 h-12 w-full font-semibold shadow-sm"
            >
              {address ? "Go to your potlucks →" : "Get started — it's free"}
            </Button>
            <p className="text-xs text-emerald-200/80 mt-4">
              Test tokens:{" "}
              <a href="https://faucet.testnet.initia.xyz" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                faucet.testnet.initia.xyz
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-emerald-600 flex items-center justify-center">
              <ChefHat className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-zinc-600">Potluck</span>
            <span>— Built on Initia testnet</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://scan.testnet.initia.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-600 transition-colors">
              InitiaScan
            </a>
            <a href="https://faucet.testnet.initia.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-600 transition-colors">
              Faucet
            </a>
            <a href="https://docs.initia.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-600 transition-colors">
              Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
