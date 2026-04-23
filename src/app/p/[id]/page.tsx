"use client"

import { useInterwovenKit } from "@initia/interwovenkit-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { use, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { UsernameBadge } from "@/components/identity/UsernameBadge"
import { AddressDetails } from "@/components/identity/AddressDetails"
import { ContributionModal } from "@/components/potluck/ContributionModal"
import { AddExpenseModal } from "@/components/potluck/AddExpenseModal"
import { ExpenseFeed } from "@/components/potluck/ExpenseFeed"
import { BalanceBoard } from "@/components/potluck/BalanceBoard"
import { AutoSignPrompt } from "@/components/potluck/AutoSignPrompt"
import { SettlementFlow } from "@/components/potluck/SettlementFlow"
import { formatAmount, fromMicro } from "@/lib/initia/chain"
import { ChefHat, ArrowLeft, ExternalLink, RefreshCw } from "lucide-react"
import Link from "next/link"
import { INITIA_TESTNET } from "@/lib/initia/chain"
import { calcBalances } from "@/lib/potluck/calc"

interface PoolData {
  pool: {
    id: string
    name: string
    description: string | null
    creator_address: string
    creator_username: string | null
    members: Array<{ address: string; username: string | null }>
    status: "open" | "closed"
    denom: string
    tx_hash: string | null
    created_at: string
  }
  contributions: Array<{
    id: string
    member_address: string
    member_username: string | null
    amount: string
    tx_hash: string
    created_at: string
  }>
  expenses: Array<{
    id: string
    description: string
    amount: string
    paid_by_address: string
    paid_by_username: string | null
    split_between: string[]
    reimbursed: boolean
    reimburse_tx_hash: string | null
    created_at: string
  }>
  balances: Array<{
    address: string
    username: string | null
    contributed: string
    expenseShare: string
    netBalance: string
  }>
}

export default function PotluckDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { address, username } = useInterwovenKit()
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery<PoolData>({
    queryKey: ["pool", id],
    queryFn: async () => {
      const res = await fetch(`/api/pools/${id}`)
      if (!res.ok) throw new Error("Pool not found")
      return res.json()
    },
    refetchInterval: 5000,
  })

  const pool = data?.pool
  const isMember = pool?.members.some((m) => m.address === address)
  const isCreator = pool?.creator_address === address

  // Total contributed (sum of all contributions)
  const totalContributed = data?.contributions.reduce(
    (sum, c) => sum + BigInt(c.amount),
    0n
  ) ?? 0n

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-zinc-500">Loading your potluck…</div>
      </div>
    )
  }

  if (!pool) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 mb-4">Potluck not found</p>
          <Link href="/dashboard"><Button variant="outline">Back to dashboard</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Nav */}
      <nav className="bg-white border-b border-zinc-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center">
                <ChefHat className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-zinc-900 truncate max-w-xs">{pool.name}</span>
              <Badge variant={pool.status === "open" ? "default" : "secondary"}>
                {pool.status === "open" ? "Open" : "Cleared"}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pool balance card */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-zinc-500 mb-1">Total at the table</p>
                <p className="text-3xl font-bold text-zinc-900">
                  {fromMicro(totalContributed)} INIT
                </p>
                {pool.description && (
                  <p className="text-sm text-zinc-400 mt-1">{pool.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                {isMember && pool.status === "open" && (
                  <>
                    <ContributionModal
                      poolId={id}
                      poolName={pool.name}
                      denom={pool.denom}
                      onSuccess={() => queryClient.invalidateQueries({ queryKey: ["pool", id] })}
                    />
                    <AddExpenseModal
                      poolId={id}
                      members={pool.members}
                      denom={pool.denom}
                      onSuccess={() => queryClient.invalidateQueries({ queryKey: ["pool", id] })}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Members list */}
            <Separator className="my-4" />
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wider mb-3">Guests at the table</p>
              <div className="flex flex-wrap gap-2">
                {pool.members.map((m) => (
                  <div key={m.address} className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-full px-3 py-1">
                    <UsernameBadge address={m.address} username={m.username} size="sm" className="gap-1.5" />
                    {m.address === pool.creator_address && (
                      <span className="text-xs text-zinc-400">host</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Auto-sign prompt */}
          {isMember && pool.status === "open" && (
            <AutoSignPrompt poolId={id} />
          )}

          {/* Expense feed */}
          <ExpenseFeed
            expenses={data?.expenses ?? []}
            contributions={data?.contributions ?? []}
            members={pool.members}
          />

          {/* Settlement flow */}
          {isCreator && pool.status === "open" && data?.balances && (
            <SettlementFlow
              poolId={id}
              poolName={pool.name}
              balances={data.balances}
              denom={pool.denom}
              onSuccess={() => queryClient.invalidateQueries({ queryKey: ["pool", id] })}
            />
          )}
        </div>

        {/* Right: Balance board */}
        <div className="space-y-4">
          <BalanceBoard
            balances={data?.balances ?? []}
            denom={pool.denom}
            poolStatus={pool.status}
          />

          {/* On-chain details */}
          <div className="bg-white rounded-xl border border-zinc-200 p-4">
            <p className="text-xs text-zinc-400 uppercase tracking-wider mb-3">On-chain details</p>
            <div className="space-y-2">
              <AddressDetails
                address={pool.creator_address}
                label="Creator"
              />
              {pool.tx_hash && (
                <div className="text-xs text-zinc-500">
                  <p className="text-zinc-400">Settlement tx</p>
                  <a
                    href={`${INITIA_TESTNET.explorerUrl}/txs/${pool.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-emerald-600 hover:underline font-mono"
                  >
                    {pool.tx_hash.slice(0, 20)}…
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              <a
                href={`${INITIA_TESTNET.explorerUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-emerald-600 hover:underline mt-1"
              >
                View on InitiaScan
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Share link */}
          <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-4">
            <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">Invite others</p>
            <p className="text-xs text-zinc-500 mb-2">Share this link to invite more guests</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
              }}
              className="text-xs text-emerald-600 hover:underline"
            >
              Copy invite link
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
