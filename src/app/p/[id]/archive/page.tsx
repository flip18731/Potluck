"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExpenseFeed } from "@/components/potluck/ExpenseFeed"
import { BalanceBoard } from "@/components/potluck/BalanceBoard"
import { UsernameBadge } from "@/components/identity/UsernameBadge"
import { INITIA_TESTNET, fromMicro } from "@/lib/initia/chain"
import { ChefHat, ArrowLeft, ExternalLink, Download } from "lucide-react"
import Link from "next/link"

export default function ArchivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["pool", id],
    queryFn: async () => {
      const res = await fetch(`/api/pools/${id}`)
      if (!res.ok) throw new Error("Not found")
      return res.json()
    },
  })

  const pool = data?.pool

  const downloadCSV = () => {
    if (!data) return
    const rows = [
      ["Type", "Description", "Amount (INIT)", "Address", "Username", "Date", "Tx Hash"],
      ...data.contributions.map((c: any) => [
        "Contribution",
        "Brought to the table",
        fromMicro(c.amount),
        c.member_address,
        c.member_username || "",
        new Date(c.created_at).toISOString(),
        c.tx_hash,
      ]),
      ...data.expenses.map((e: any) => [
        "Expense",
        e.description,
        fromMicro(e.amount),
        e.paid_by_address,
        e.paid_by_username || "",
        new Date(e.created_at).toISOString(),
        e.reimburse_tx_hash || "",
      ]),
    ]
    const csv = rows.map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `potluck-${pool?.name?.replace(/\s+/g, "-")}-${id.slice(0, 8)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-zinc-400">Loading archive…</div>
      </div>
    )
  }

  if (isError || !pool) {
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
      <nav className="bg-white border-b border-zinc-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href={`/p/${id}`}>
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> Back</Button>
          </Link>
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-emerald-600" />
            <span className="font-bold">{pool.name}</span>
            <Badge variant="secondary">Cleared</Badge>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Potluck Archive</h1>
            <p className="text-zinc-500">Full history of {pool.name}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadCSV}>
              <Download className="h-4 w-4" />
              Download CSV
            </Button>
            {pool.tx_hash && (
              <Button variant="outline" size="sm" asChild>
                <a href={`${INITIA_TESTNET.explorerUrl}/txs/${pool.tx_hash}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Settlement tx
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ExpenseFeed
              expenses={data.expenses}
              contributions={data.contributions}
              members={pool.members}
            />
          </div>
          <div>
            <BalanceBoard
              balances={data.balances}
              denom={pool.denom}
              poolStatus="closed"
            />
          </div>
        </div>
      </main>
    </div>
  )
}
