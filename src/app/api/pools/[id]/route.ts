import { NextRequest, NextResponse } from "next/server"
import { getServiceSupabase } from "@/lib/db/supabase"
import { calcBalances } from "@/lib/potluck/calc"
import { DbContribution, DbExpense, DbMember } from "@/lib/potluck/types"
import { fromMicro } from "@/lib/initia/chain"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = getServiceSupabase()

  const [poolRes, contributionsRes, expensesRes] = await Promise.all([
    db.from("pools").select("*").eq("id", id).single(),
    db.from("contributions").select("*").eq("pool_id", id).order("created_at"),
    db.from("expenses").select("*").eq("pool_id", id).order("created_at"),
  ])

  if (poolRes.error || !poolRes.data) {
    return NextResponse.json({ error: "Pool not found" }, { status: 404 })
  }

  const members: DbMember[] = poolRes.data.members ?? []
  const contributions: DbContribution[] = contributionsRes.data ?? []
  const expenses: DbExpense[] = expensesRes.data ?? []

  const balances = calcBalances(members, contributions, expenses)

  return NextResponse.json({
    pool: poolRes.data,
    contributions,
    expenses,
    balances: balances.map((b) => ({
      ...b,
      contributed: b.contributed.toString(),
      expenseShare: b.expenseShare.toString(),
      netBalance: b.netBalance.toString(),
    })),
  })
}
