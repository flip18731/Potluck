"use client"

import { useState } from "react"
import { useInterwovenKit } from "@initia/interwovenkit-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { toMicro, INITIA_TESTNET } from "@/lib/initia/chain"
import { isAutoSignEnabled } from "@/lib/initia/autosign"
import { Loader2, Wallet } from "lucide-react"

interface ContributionModalProps {
  poolId: string
  poolName: string
  denom: string
  onSuccess: () => void
}

export function ContributionModal({ poolId, poolName, denom, onSuccess }: ContributionModalProps) {
  const { address, username, requestTxBlock } = useInterwovenKit()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)

  const treasuryAddress = process.env.NEXT_PUBLIC_TREASURY_ADDRESS!

  const handleContribute = async () => {
    if (!address) { toast.error("Connect your account first"); return }
    if (!amount || parseFloat(amount) <= 0) { toast.error("Enter a valid amount"); return }
    if (!treasuryAddress) { toast.error("Treasury not configured"); return }

    setLoading(true)
    try {
      const amountMicro = toMicro(amount).toString()

      // Send real MsgSend to treasury address with pool memo
      const { transactionHash } = await requestTxBlock({
        messages: [
          {
            typeUrl: "/cosmos.bank.v1beta1.MsgSend",
            value: {
              fromAddress: address,
              toAddress: treasuryAddress,
              amount: [{ denom: denom || "uinit", amount: amountMicro }],
            },
          },
        ],
      })

      // Record in DB
      await fetch(`/api/pools/${poolId}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberAddress: address,
          memberUsername: username || null,
          amount: amountMicro,
          txHash: transactionHash,
        }),
      })

      toast.success(`Brought ${amount} INIT to the table!`, {
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Wallet className="h-4 w-4" />
          Bring your share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bring your share</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-zinc-500">
            Contributing to <strong>{poolName}</strong>. Funds are held in the potluck treasury on Initia.
          </p>

          <div>
            <Label htmlFor="amount">Amount (INIT)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1.5 text-xl font-mono"
              onKeyDown={(e) => e.key === "Enter" && handleContribute()}
            />
            <p className="text-xs text-zinc-400 mt-1">= {amount ? toMicro(amount).toLocaleString() : 0} uinit</p>
          </div>

          {autoSign && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              One-tap approval active — no popup needed
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleContribute}
            disabled={loading || !amount || parseFloat(amount) <= 0}
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Passing it over…</>
            ) : (
              `Bring ${amount || "0"} INIT to the table`
            )}
          </Button>

          <p className="text-xs text-zinc-400 text-center">
            This sends a real on-chain transaction to the Potluck treasury.
            Your contribution is trackable on InitiaScan.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
