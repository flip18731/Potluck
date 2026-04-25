"use client"

import { useState } from "react"
import { useInterwovenKit } from "@initia/interwovenkit-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { fromMicro, UINIT_DENOM } from "@/lib/initia/chain"
import { BRIDGE_TARGETS, buildBridgeDetails } from "@/lib/initia/bridge"
import { IconGlobe, IconLoader } from "@/components/ui/inline-svg"
import { toast } from "sonner"
import { COLORS, HEARTH } from "@/lib/design/tokens"

interface WithdrawToChainModalProps {
  amount: string
  denom: string
}

export function WithdrawToChainModal({ amount, denom }: WithdrawToChainModalProps) {
  const { openBridge } = useInterwovenKit()
  const [open, setOpen] = useState(false)
  const [bridging, setBridging] = useState(false)

  const displayAmount = fromMicro(amount)
  const displayDenom = denom === UINIT_DENOM ? "INIT" : denom.replace("u", "").toUpperCase()

  const handleBridge = async (target: typeof BRIDGE_TARGETS[0]) => {
    setBridging(true)
    try {
      const details = buildBridgeDetails(target.chainId, target.denom)
      await openBridge(details)
      setOpen(false)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Couldn’t open bridge — try again")
    } finally {
      setBridging(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs h-auto py-1 px-2 inline-flex items-center gap-1" style={{ color: COLORS.stone500 }}>
          <IconGlobe size={12} color={COLORS.stone500} />
          Take home
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Take leftovers home</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div
            className="text-center p-4 rounded-xl tabular"
            style={{ backgroundColor: COLORS.hearthLight, border: `1px solid ${COLORS.cardBorder}` }}
          >
            <p className="text-2xl font-bold" style={{ color: HEARTH }}>{displayAmount} {displayDenom}</p>
            <p className="text-sm mt-1" style={{ color: COLORS.stone600 }}>Your share from the potluck</p>
          </div>

          <p className="text-sm" style={{ color: COLORS.stone600 }}>
            Move your {displayAmount} {displayDenom} to another chain in the Initia network using Interwoven Bridge.
          </p>

          <div className="space-y-2">
            {BRIDGE_TARGETS.map((target) => (
              <button
                key={target.chainId}
                type="button"
                onClick={() => handleBridge(target)}
                disabled={bridging}
                className="w-full flex items-center justify-between p-3 rounded-xl border transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95"
                style={{
                  borderColor: COLORS.cardBorder,
                  backgroundColor: COLORS.white,
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: HEARTH }}
                  >
                    {bridging ? (
                      <IconLoader size={16} color="#FFFFFF" />
                    ) : (
                      <IconGlobe size={14} color="#FFFFFF" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium" style={{ color: COLORS.dark }}>{target.chainName}</p>
                    <p className="text-xs tabular" style={{ color: COLORS.stone400 }}>{target.chainId}</p>
                  </div>
                </div>
                <span className="text-xs font-medium" style={{ color: HEARTH }}>Bridge →</span>
              </button>
            ))}
          </div>

          <p className="text-xs text-center" style={{ color: COLORS.stone400 }}>
            Powered by{" "}
            <a
              href="https://bridge.testnet.initia.xyz"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: HEARTH }}
              className="hover:underline"
            >
              Interwoven Bridge
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
