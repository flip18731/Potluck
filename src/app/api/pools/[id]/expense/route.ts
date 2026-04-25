import { NextRequest, NextResponse } from "next/server"
import { getServiceSupabase } from "@/lib/db/supabase"
import { sendFromTreasury } from "@/lib/initia/treasury"

// POST /api/pools/:id/expense
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const {
    description,
    amount,
    paidByAddress,
    paidByUsername,
    splitBetween,
    reimbursedFromPool,
  } = body

  if (!description || amount === undefined || amount === null || !paidByAddress || !splitBetween?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  let amountMicroStr: string
  try {
    amountMicroStr = BigInt(String(amount)).toString()
    if (BigInt(amountMicroStr) <= 0n) {
      return NextResponse.json({ error: "Amount must be greater than zero" }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
  }

  const db = getServiceSupabase()

  const { data: pool } = await db
    .from("pools")
    .select("*")
    .eq("id", id)
    .single()

  if (!pool) return NextResponse.json({ error: "Pool not found" }, { status: 404 })
  if (pool.status === "closed") return NextResponse.json({ error: "Pool is closed" }, { status: 400 })

  const members: Array<{ address: string }> = pool.members ?? []
  if (!members.find((m) => m.address === paidByAddress)) {
    return NextResponse.json({ error: "Payer is not a member" }, { status: 403 })
  }

  let reimburseTxHash: string | null = null

  // If paid out-of-pocket and auto-reimburse is requested, send from treasury
  if (reimbursedFromPool) {
    try {
      const { txhash } = await sendFromTreasury(paidByAddress, amountMicroStr, pool.denom)
      reimburseTxHash = txhash
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Treasury send failed"
      return NextResponse.json({ error: msg }, { status: 500 })
    }
  }

  const { data, error } = await db
    .from("expenses")
    .insert({
      pool_id: id,
      description,
      amount: amountMicroStr,
      paid_by_address: paidByAddress,
      paid_by_username: paidByUsername ?? null,
      split_between: splitBetween,
      reimbursed: reimbursedFromPool ?? false,
      reimburse_tx_hash: reimburseTxHash,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
