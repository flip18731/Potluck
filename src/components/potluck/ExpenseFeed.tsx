"use client"

import { Avatar } from "@/components/ui/Avatar"
import { fromMicro } from "@/lib/initia/chain"
import { formatDistanceToNow } from "date-fns"

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
  currentUserAddress?: string
}

type FeedItem =
  | { type: "expense"; data: Expense; date: Date }
  | { type: "contribution"; data: Contribution; date: Date }

export function ExpenseFeed({ expenses, contributions, members, currentUserAddress }: ExpenseFeedProps) {
  const feed: FeedItem[] = [
    ...expenses.map((e) => ({ type: "expense" as const, data: e, date: new Date(e.created_at) })),
    ...contributions.map((c) => ({ type: "contribution" as const, data: c, date: new Date(c.created_at) })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  if (feed.length === 0) {
    return (
      <div style={{ padding: "24px 0", textAlign: "center", fontSize: 13, color: "#C4BAB0" }}>
        Nothing on the spread yet
      </div>
    )
  }

  return (
    <div>
      {feed.map((item, i) => {
        if (item.type === "contribution") {
          const c = item.data
          const handle = c.member_username || c.member_address.slice(0, 8)
          const displayName = c.member_username || undefined
          const isMe = c.member_address === currentUserAddress

          return (
            <div
              key={`c-${c.id}`}
              className="fade-slide"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "11px 0",
                borderBottom: "1px solid #EDE8E1",
                animationDelay: `${200 + i * 40}ms`,
              }}
            >
              <Avatar handle={handle} displayName={displayName} size={28} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 480, color: "#1C1917", lineHeight: 1.3 }}>
                  {isMe ? "You" : (displayName || handle)} brought {fromMicro(c.amount)} INIT
                </div>
                <div style={{ fontSize: 12, color: "#A8A29E", marginTop: 2 }}>
                  {formatDistanceToNow(item.date, { addSuffix: true })}
                  {" · "}
                  added to the pot
                </div>
              </div>
              <div className="tabular" style={{ fontSize: 14, fontWeight: 500, color: "#1C1917", flexShrink: 0 }}>
                +{fromMicro(c.amount)} INIT
              </div>
            </div>
          )
        }

  const e = item.data
        const handle = e.paid_by_username || e.paid_by_address.slice(0, 8)
        const displayName = e.paid_by_username || undefined
        const isMe = e.paid_by_address === currentUserAddress

        return (
          <div
            key={`e-${e.id}`}
            className="fade-slide"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "11px 0",
              borderBottom: "1px solid #EDE8E1",
              animationDelay: `${200 + i * 40}ms`,
            }}
          >
            <Avatar handle={handle} displayName={displayName} size={28} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 480, color: "#1C1917", lineHeight: 1.3 }}>
                {e.description}
              </div>
              <div style={{ fontSize: 12, color: "#A8A29E", marginTop: 2 }}>
                {isMe ? "You paid" : `${displayName || handle} paid`}
                {" · "}split {e.split_between.length} ways
                {" · "}{formatDistanceToNow(item.date, { addSuffix: true })}
                {e.reimbursed && " · settled"}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div className="tabular" style={{ fontSize: 14, fontWeight: 500, color: "#1C1917" }}>
                {fromMicro(e.amount)} INIT
              </div>
              {e.reimbursed ? (
                <div style={{ fontSize: 11, color: "#A8A29E", marginTop: 2 }}>Settled</div>
              ) : (
                <div style={{ fontSize: 11, color: "#C4BAB0", marginTop: 2 }}>In progress</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
