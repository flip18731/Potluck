"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UsernameBadge } from "@/components/identity/UsernameBadge"
import { fromMicro, INITIA_TESTNET, UINIT_DENOM } from "@/lib/initia/chain"
import { useInterwovenKit } from "@initia/interwovenkit-react"
import { toast } from "sonner"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { IconLoader, IconAlert } from "@/components/ui/inline-svg"
import { WithdrawToChainModal } from "./WithdrawToChainModal"
import { COLORS, HEARTH } from "@/lib/design/tokens"
import { humanizeTxError } from "@/lib/initia/tx-errors"

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

  const displayDenom = denom === UINIT_DENOM ? "INIT" : denom.replace("u", "").toUpperCase()
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
      toast.success("Table cleared! Everyone has been settled.", {
        description: data.txHash ? `Receipt: ${data.txHash.slice(0, 20)}…` : undefined,
        action: data.txHash ? {
          label: "View",
          onClick: () => window.open(`${INITIA_TESTNET.explorerUrl}/txs/${data.txHash}`, "_blank"),
        } : undefined,
      })
      setOpen(false)
      onSuccess()
    } catch (e: unknown) {
      toast.error(humanizeTxError(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="rounded-xl border p-5"
      style={{ backgroundColor: COLORS.white, borderColor: COLORS.cardBorder }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold" style={{ color: COLORS.dark }}>Clear the table</h2>
          <p className="text-sm" style={{ color: COLORS.stone600 }}>Settle everyone and close this potluck</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant={canClose ? "default" : "outline"} disabled={!canClose}>
              Clear the table
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Clear the table — {poolName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm" style={{ color: COLORS.stone600 }}>
                This sends payouts to all members and closes the potluck permanently.
              </p>

              {recipients.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider mb-2" style={{ color: COLORS.stone400 }}>Payouts</p>
                  <div className="space-y-2">
                    {recipients.map((b) => (
                      <div key={b.address} className="flex items-center justify-between">
                        <UsernameBadge address={b.address} username={b.username} size="sm" />
                        <span className="text-sm font-semibold tabular" style={{ color: HEARTH }}>
                          +{fromMicro(b.netBalance)} {displayDenom}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div
                className="rounded-lg p-3 text-xs"
                style={{
                  backgroundColor: COLORS.hearthLight,
                  border: `1px solid ${COLORS.cardBorder}`,
                  color: COLORS.stone600,
                }}
              >
                Payouts use the shared Potluck treasury. After confirming, you’ll get a receipt link for each transfer.
              </div>

              <Button
                className="w-full"
                onClick={handleClose}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <IconLoader size={16} />
                    Clearing the table…
                  </span>
                ) : (
                  "Confirm — clear the table"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {debtors.length > 0 && (
        <div className="space-y-2">
          <div
            className="flex items-center gap-2 text-sm rounded-lg px-3 py-2"
            style={{
              color: COLORS.stone600,
              backgroundColor: COLORS.hearthLight,
              border: `1px solid ${COLORS.cardBorder}`,
            }}
          >
            <IconAlert size={16} color={HEARTH} />
            <span>Table can be cleared after these guests bring more:</span>
          </div>
          {debtors.map((b) => (
            <div
              key={b.address}
              className="flex items-center justify-between px-3 py-2 rounded-lg border"
              style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA" }}
            >
              <UsernameBadge address={b.address} username={b.username} size="sm" />
              <span className="text-sm font-medium tabular" style={{ color: "#B91C1C" }}>
                needs {fromMicro((-BigInt(b.netBalance)).toString())} {displayDenom}
              </span>
            </div>
          ))}
        </div>
      )}

      {canClose && recipients.length > 0 && (
        <div className="space-y-2 mt-3">
          <p className="text-xs" style={{ color: COLORS.stone400 }}>Payouts on settlement:</p>
          {recipients.map((b) => (
            <div key={b.address} className="flex items-center justify-between">
              <UsernameBadge address={b.address} username={b.username} size="sm" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tabular" style={{ color: HEARTH }}>
                  +{fromMicro(b.netBalance)} {displayDenom}
                </span>
                <WithdrawToChainModal
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
