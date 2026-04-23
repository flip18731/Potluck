"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UsernameBadge } from "@/components/identity/UsernameBadge"
import { fromMicro, INITIA_TESTNET } from "@/lib/initia/chain"
import { useInterwovenKit } from "@initia/interwovenkit-react"
import { toast } from "sonner"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react"
import { WithdrawToChainModal } from "./WithdrawToChainModal"

interface Balance {
  address: string
  username: string | null
  contributed: string
  expenseShare: string
  netBalance: string
}

interface SettlementFlowProps {
  poolId: string
  poolName: string
  balances: Balance[]
  denom: string
  onSuccess: () => void
}

export function SettlementFlow({ poolId, poolName, balances, denom, onSuccess }: SettlementFlowProps) {
  const { address } = useInterwovenKit()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [settleTxHash, setSettleTxHash] = useState<string | null>(null)

  const displayDenom = denom.replace("u", "").toUpperCase()
  const debtors = balances.filter((b) => BigInt(b.netBalance) < 0n)
  const recipients = balances.filter((b) => BigInt(b.netBalance) > 0n)
  const canClose = debtors.length === 0

  const handleClose = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/pools/${poolId}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requesterAddress: address }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Settlement failed")
      }
      setSettleTxHash(data.txHash || null)
      toast.success("Table cleared! Everyone has been settled.", {
        description: data.txHash ? `Tx: ${data.txHash.slice(0, 20)}…` : undefined,
        action: data.txHash ? {
          label: "View",
          onClick: () => window.open(`${INITIA_TESTNET.explorerUrl}/txs/${data.txHash}`, "_blank"),
        } : undefined,
      })
      setOpen(false)
      onSuccess()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Settlement failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-zinc-900">Clear the table</h2>
          <p className="text-sm text-zinc-500">Settle everyone and close this potluck</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant={canClose ? "default" : "outline"} disabled={!canClose}>
              Clear the table
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear the table — {poolName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-zinc-500">
                This will send settlement payouts to all members and close the potluck permanently.
              </p>

              {/* Who receives what */}
              {recipients.length > 0 && (
                <div>
                  <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">Payouts</p>
                  <div className="space-y-2">
                    {recipients.map((b) => (
                      <div key={b.address} className="flex items-center justify-between">
                        <UsernameBadge address={b.address} username={b.username} size="sm" />
                        <span className="text-sm font-semibold text-emerald-600">
                          +{fromMicro(b.netBalance)} {displayDenom}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                All payouts happen as real on-chain transactions via the Potluck treasury.
                Each transfer is verifiable on InitiaScan.
              </div>

              <Button
                className="w-full"
                onClick={handleClose}
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Clearing the table…</>
                ) : (
                  "Confirm — clear the table"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Debt warnings */}
      {debtors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>Table can be cleared after these guests bring more:</span>
          </div>
          {debtors.map((b) => (
            <div key={b.address} className="flex items-center justify-between px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <UsernameBadge address={b.address} username={b.username} size="sm" />
              <span className="text-sm font-medium text-red-600">
                needs {fromMicro((-BigInt(b.netBalance)).toString())} {displayDenom}
              </span>
            </div>
          ))}
        </div>
      )}

      {canClose && recipients.length > 0 && (
        <div className="space-y-2 mt-3">
          <p className="text-xs text-zinc-400">Payouts on settlement:</p>
          {recipients.map((b) => (
            <div key={b.address} className="flex items-center justify-between">
              <UsernameBadge address={b.address} username={b.username} size="sm" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-emerald-600">
                  +{fromMicro(b.netBalance)} {displayDenom}
                </span>
                <WithdrawToChainModal
                  memberAddress={b.address}
                  amount={b.netBalance}
                  denom={denom}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
