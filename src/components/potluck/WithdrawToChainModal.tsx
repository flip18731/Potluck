"use client"

import { useState } from "react"
import { useInterwovenKit } from "@initia/interwovenkit-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { fromMicro, INITIA_TESTNET } from "@/lib/initia/chain"
import { BRIDGE_TARGETS, buildBridgeDetails } from "@/lib/initia/bridge"
import { Globe, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface WithdrawToChainModalProps {
  memberAddress: string
  amount: string
  denom: string
}

export function WithdrawToChainModal({ memberAddress, amount, denom }: WithdrawToChainModalProps) {
  const { openBridge } = useInterwovenKit()
  const [open, setOpen] = useState(false)
  const [bridging, setBridging] = useState(false)

  const displayAmount = fromMicro(amount)
  const displayDenom = denom.replace("u", "").toUpperCase()

  const handleBridge = async (target: typeof BRIDGE_TARGETS[0]) => {
    setBridging(true)
    try {
      const details = buildBridgeDetails(target.chainId, target.denom)
      await openBridge(details)
      setOpen(false)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Bridge failed — try again")
    } finally {
      setBridging(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs text-zinc-400 hover:text-zinc-700">
          <Globe className="h-3 w-3" />
          Take home
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Take leftovers home</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="text-center p-4 bg-emerald-50 rounded-xl">
            <p className="text-2xl font-bold text-emerald-700">{displayAmount} {displayDenom}</p>
            <p className="text-sm text-emerald-600 mt-1">Your share from the potluck</p>
          </div>

          <p className="text-sm text-zinc-500">
            Take your {displayAmount} {displayDenom} home to another chain in the Initia ecosystem via Interwoven Bridge.
            No IBAN, no SWIFT, no wait.
          </p>

          <div className="space-y-2">
            {BRIDGE_TARGETS.map((target) => (
              <button
                key={target.chainId}
                onClick={() => handleBridge(target)}
                disabled={bridging}
                className="w-full flex items-center justify-between p-3 border border-zinc-200 rounded-xl hover:bg-zinc-50 hover:border-emerald-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                    {bridging ? (
                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                    ) : (
                      <Globe className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{target.chainName}</p>
                    <p className="text-xs text-zinc-400">{target.chainId}</p>
                  </div>
                </div>
                <span className="text-xs text-emerald-600 font-medium">Bridge →</span>
              </button>
            ))}
          </div>

          <p className="text-xs text-zinc-400 text-center">
            Powered by{" "}
            <a href="https://bridge.testnet.initia.xyz" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
              Interwoven Bridge
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
