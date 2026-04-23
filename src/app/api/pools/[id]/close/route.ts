import { NextRequest, NextResponse } from "next/server"
import { getServiceSupabase } from "@/lib/db/supabase"
import { calcBalances, canClosePool, getMembersInDebt } from "@/lib/potluck/calc"
import { DbContribution, DbExpense, DbMember } from "@/lib/potluck/types"
import { batchSendFromTreasury } from "@/lib/initia/treasury"
import { formatAmount } from "@/lib/initia/chain"

// POST /api/pools/:id/close — settle and close the pool
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { requesterAddress } = body

  const db = getServiceSupabase()

  const [poolRes, contributionsRes, expensesRes] = await Promise.all([
    db.from("pools").select("*").eq("id", id).single(),
    db.from("contributions").select("*").eq("pool_id", id),
    db.from("expenses").select("*").eq("pool_id", id),
  ])

  if (!poolRes.data) return NextResponse.json({ error: "Pool not found" }, { status: 404 })
  const pool = poolRes.data
  if (pool.status === "closed") return NextResponse.json({ error: "Pool already closed" }, { status: 400 })
  if (pool.creator_address !== requesterAddress) {
    return NextResponse.json({ error: "Only the creator can clear the table" }, { status: 403 })
  }

  const members: DbMember[] = pool.members ?? []
  const contributions: DbContribution[] = contributionsRes.data ?? []
  const expenses: DbExpense[] = expensesRes.data ?? []

  const balances = calcBalances(members, contributions, expenses)

  if (!canClosePool(balances)) {
    const debtors = getMembersInDebt(balances)
    const msg = debtors
      .map((d) => `${d.username || d.address.slice(0, 8)} owes ${formatAmount((-d.netBalance).toString(), pool.denom.replace("u", "").toUpperCase())}`)
      .join(", ")
    return NextResponse.json(
      { error: `Table can be cleared after: ${msg}`, debtors: debtors.map((d) => ({ address: d.address, owes: (-d.netBalance).toString() })) },
      { status: 400 }
    )
  }

  // Send settlements
  const transfers = balances
    .filter((b) => b.netBalance > 0n)
    .map((b) => ({ to: b.address, amount: b.netBalance.toString(), denom: pool.denom }))

  let settleTxHash = ""
  if (transfers.length > 0) {
    try {
      const result = await batchSendFromTreasury(transfers)
      settleTxHash = result.txhash
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Settlement failed"
      return NextResponse.json({ error: msg }, { status: 500 })
    }
  }

  // Mark pool as closed
  await db.from("pools").update({ status: "closed", tx_hash: settleTxHash || null }).eq("id", id)

  return NextResponse.json({
    success: true,
    txHash: settleTxHash,
    settlements: transfers,
  })
}
