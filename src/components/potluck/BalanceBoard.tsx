"use client"

import { UsernameBadge } from "@/components/identity/UsernameBadge"
import { fromMicro } from "@/lib/initia/chain"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface Balance {
  address: string
  username: string | null
  contributed: string
  expenseShare: string
  netBalance: string
}

interface BalanceBoardProps {
  balances: Balance[]
  denom: string
  poolStatus: "open" | "closed"
}

export function BalanceBoard({ balances, denom, poolStatus }: BalanceBoardProps) {
  const displayDenom = denom.replace("u", "").toUpperCase()

  return (
    <div className="bg-white rounded-xl border border-zinc-200">
      <div className="p-4 border-b border-zinc-100">
        <h2 className="font-semibold text-zinc-900">Who owes what</h2>
        <p className="text-xs text-zinc-400 mt-0.5">Live balance board</p>
      </div>
      <div className="divide-y divide-zinc-100">
        {balances.length === 0 && (
          <div className="p-4 text-center text-sm text-zinc-400">
            No contributions yet
          </div>
        )}
        {balances.map((b) => {
          const net = BigInt(b.netBalance)
          const isPositive = net > 0n
          const isNegative = net < 0n
          const isZero = net === 0n
          const displayNet = isNegative ? (-net).toString() : net.toString()

          return (
            <div key={b.address} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <UsernameBadge address={b.address} username={b.username} size="sm" />
                <div className={`flex items-center gap-1 font-semibold text-sm ${
                  isPositive ? "text-emerald-600" : isNegative ? "text-red-600" : "text-zinc-500"
                }`}>
                  {isPositive && <TrendingUp className="h-3.5 w-3.5" />}
                  {isNegative && <TrendingDown className="h-3.5 w-3.5" />}
                  {isZero && <Minus className="h-3.5 w-3.5" />}
                  {isNegative ? "-" : isPositive ? "+" : ""}
                  {fromMicro(displayNet)} {displayDenom}
                </div>
              </div>
              <div className="text-xs text-zinc-400 space-y-0.5">
                <div className="flex justify-between">
                  <span>Brought</span>
                  <span className="font-mono">{fromMicro(b.contributed)} {displayDenom}</span>
                </div>
                <div className="flex justify-between">
                  <span>Share of expenses</span>
                  <span className="font-mono">-{fromMicro(b.expenseShare)} {displayDenom}</span>
                </div>
              </div>
              {isNegative && poolStatus === "open" && (
                <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                  Needs to bring {fromMicro(displayNet)} more before the table can be cleared
                </div>
              )}
              {isPositive && poolStatus === "closed" && (
                <div className="mt-2 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  Received {fromMicro(displayNet)} {displayDenom} at settlement
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
