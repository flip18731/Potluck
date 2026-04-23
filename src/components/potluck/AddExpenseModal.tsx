"use client"

import { useState } from "react"
import { useInterwovenKit } from "@initia/interwovenkit-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UsernameBadge } from "@/components/identity/UsernameBadge"
import { toast } from "sonner"
import { toMicro, INITIA_TESTNET } from "@/lib/initia/chain"
import { Loader2, UtensilsCrossed } from "lucide-react"
import { formatIdentity } from "@/lib/initia/username"

interface Member {
  address: string
  username: string | null
}

interface AddExpenseModalProps {
  poolId: string
  members: Member[]
  denom: string
  onSuccess: () => void
}

export function AddExpenseModal({ poolId, members, denom, onSuccess }: AddExpenseModalProps) {
  const { address } = useInterwovenKit()
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [paidByAddress, setPaidByAddress] = useState(address || members[0]?.address || "")
  const [splitBetween, setSplitBetween] = useState<string[]>(members.map((m) => m.address))
  const [loading, setLoading] = useState(false)

  const toggleSplit = (addr: string) => {
    setSplitBetween((prev) =>
      prev.includes(addr) ? prev.filter((a) => a !== addr) : [...prev, addr]
    )
  }

  const handleSubmit = async () => {
    if (!description.trim()) { toast.error("Add a description"); return }
    if (!amount || parseFloat(amount) <= 0) { toast.error("Enter a valid amount"); return }
    if (splitBetween.length === 0) { toast.error("Select at least one person to split between"); return }
    if (!paidByAddress) { toast.error("Select who paid"); return }

    setLoading(true)
    try {
      const amountMicro = toMicro(amount).toString()
      const paidByMember = members.find((m) => m.address === paidByAddress)

      const res = await fetch(`/api/pools/${poolId}/expense`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          amount: amountMicro,
          paidByAddress,
          paidByUsername: paidByMember?.username ?? null,
          splitBetween,
          reimbursedFromPool: true, // Auto-reimburse from treasury
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to add expense")
      }
      const expense = await res.json()

      const paidByDisplay = formatIdentity(paidByAddress, paidByMember?.username ?? null)
      toast.success(`Expense added — passing the plate to ${paidByDisplay}`, {
        description: `${description}: ${amount} INIT`,
      })

      setDescription("")
      setAmount("")
      setOpen(false)
      onSuccess()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UtensilsCrossed className="h-4 w-4" />
          Add to the spread
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add to the spread</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="exp-description">What was it for?</Label>
            <Input
              id="exp-description"
              placeholder="Dinner, Airbnb, Groceries…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="exp-amount">Amount (INIT)</Label>
            <Input
              id="exp-amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1.5 font-mono"
            />
          </div>

          <div>
            <Label>Who paid?</Label>
            <div className="mt-1.5 space-y-2">
              {members.map((m) => (
                <label key={m.address} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  paidByAddress === m.address ? "border-emerald-500 bg-emerald-50" : "border-zinc-200 hover:bg-zinc-50"
                }`}>
                  <input
                    type="radio"
                    name="paidBy"
                    value={m.address}
                    checked={paidByAddress === m.address}
                    onChange={() => setPaidByAddress(m.address)}
                    className="accent-emerald-600"
                  />
                  <UsernameBadge address={m.address} username={m.username} size="sm" />
                  {m.address === address && <span className="ml-auto text-xs text-zinc-400">you</span>}
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Split between</Label>
            <div className="mt-1.5 space-y-2">
              {members.map((m) => (
                <label key={m.address} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  splitBetween.includes(m.address) ? "border-emerald-500 bg-emerald-50" : "border-zinc-200 hover:bg-zinc-50"
                }`}>
                  <input
                    type="checkbox"
                    checked={splitBetween.includes(m.address)}
                    onChange={() => toggleSplit(m.address)}
                    className="accent-emerald-600"
                  />
                  <UsernameBadge address={m.address} username={m.username} size="sm" />
                  {splitBetween.includes(m.address) && amount && splitBetween.length > 0 && (
                    <span className="ml-auto text-xs text-zinc-400">
                      {(parseFloat(amount) / splitBetween.length).toFixed(2)} INIT
                    </span>
                  )}
                </label>
              ))}
            </div>
            <p className="text-xs text-zinc-400 mt-1">Split equally among selected guests</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            <strong>Passing the plate:</strong> The treasury will send {amount || "0"} INIT to{" "}
            {members.find((m) => m.address === paidByAddress)
              ? formatIdentity(paidByAddress, members.find((m) => m.address === paidByAddress)?.username ?? null)
              : "the payer"}{" "}
            automatically.
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Passing the plate…</>
            ) : (
              "Add to the spread"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
