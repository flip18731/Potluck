"use client"

import { UsernameBadge } from "@/components/identity/UsernameBadge"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatAmount, fromMicro, INITIA_TESTNET } from "@/lib/initia/chain"
import { formatIdentity } from "@/lib/initia/username"
import { formatDistanceToNow } from "date-fns"
import { CheckCircle, Clock, Receipt, ExternalLink, ArrowUpRight } from "lucide-react"

interface Expense {
  id: string
  description: string
  amount: string
  paid_by_address: string
  paid_by_username: string | null
  split_between: string[]
  reimbursed: boolean
  reimburse_tx_hash: string | null
  created_at: string
}

interface Contribution {
  id: string
  member_address: string
  member_username: string | null
  amount: string
  tx_hash: string
  created_at: string
}

interface Member {
  address: string
  username: string | null
}

interface ExpenseFeedProps {
  expenses: Expense[]
  contributions: Contribution[]
  members: Member[]
}

type FeedItem =
  | { type: "expense"; data: Expense; date: Date }
  | { type: "contribution"; data: Contribution; date: Date }

export function ExpenseFeed({ expenses, contributions, members }: ExpenseFeedProps) {
  const feed: FeedItem[] = [
    ...expenses.map((e) => ({ type: "expense" as const, data: e, date: new Date(e.created_at) })),
    ...contributions.map((c) => ({ type: "contribution" as const, data: c, date: new Date(c.created_at) })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  const getMember = (address: string) => members.find((m) => m.address === address)

  if (feed.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200 p-6 text-center">
        <Receipt className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
        <p className="text-zinc-500 font-medium">Nothing on the spread yet</p>
        <p className="text-sm text-zinc-400">Bring your share or add the first expense</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200">
      <div className="p-4 border-b border-zinc-100">
        <h2 className="font-semibold text-zinc-900">Activity</h2>
      </div>
      <div className="divide-y divide-zinc-100">
        {feed.map((item) => {
          if (item.type === "contribution") {
            const c = item.data
            const member = getMember(c.member_address)
            return (
              <div key={`c-${c.id}`} className="p-4 flex items-start gap-3 hover:bg-zinc-50 animate-fade-in">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 flex-wrap">
                    <UsernameBadge
                      address={c.member_address}
                      username={c.member_username || member?.username}
                      size="sm"
                    />
                    <span className="text-sm text-zinc-600">
                      brought <strong className="text-zinc-900">{fromMicro(c.amount)} INIT</strong> to the table
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(item.date, { addSuffix: true })}
                    </span>
                    <a
                      href={`${INITIA_TESTNET.explorerUrl}/txs/${c.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 hover:underline flex items-center gap-0.5"
                    >
                      verify
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>
                <Badge variant="success">{fromMicro(c.amount)} INIT</Badge>
              </div>
            )
          }

          const e = item.data
          const payer = getMember(e.paid_by_address)
          return (
            <div key={`e-${e.id}`} className="p-4 flex items-start gap-3 hover:bg-zinc-50 animate-fade-in">
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Receipt className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900">{e.description}</p>
                <div className="flex items-center gap-1 mt-0.5 flex-wrap text-sm text-zinc-500">
                  <span>Paid by</span>
                  <UsernameBadge
                    address={e.paid_by_address}
                    username={e.paid_by_username || payer?.username}
                    size="sm"
                  />
                  <span>• split {e.split_between.length} ways</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(item.date, { addSuffix: true })}
                  </span>
                  {e.reimbursed && e.reimburse_tx_hash && (
                    <a
                      href={`${INITIA_TESTNET.explorerUrl}/txs/${e.reimburse_tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 hover:underline flex items-center gap-0.5"
                    >
                      reimbursement tx
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-medium text-zinc-900">{fromMicro(e.amount)} INIT</span>
                {e.reimbursed ? (
                  <Badge variant="success" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Reimbursed
                  </Badge>
                ) : (
                  <Badge variant="warning">Pending</Badge>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
