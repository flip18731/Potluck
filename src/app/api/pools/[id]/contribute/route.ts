import { NextRequest, NextResponse } from "next/server"
import { getServiceSupabase } from "@/lib/db/supabase"

// POST /api/pools/:id/contribute
// Records a confirmed on-chain contribution
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { memberAddress, memberUsername, amount, txHash } = body

  if (!memberAddress || !amount || !txHash) {
    return NextResponse.json({ error: "memberAddress, amount, txHash required" }, { status: 400 })
  }

  const db = getServiceSupabase()

  // Verify the pool exists and member is included
  const { data: pool, error: poolErr } = await db
    .from("pools")
    .select("id, members, status")
    .eq("id", id)
    .single()

  if (poolErr || !pool) {
    return NextResponse.json({ error: "Pool not found" }, { status: 404 })
  }

  if (pool.status === "closed") {
    return NextResponse.json({ error: "Pool is closed" }, { status: 400 })
  }

  const members: Array<{ address: string }> = pool.members ?? []
  if (!members.find((m) => m.address === memberAddress)) {
    return NextResponse.json({ error: "Not a member of this pool" }, { status: 403 })
  }

  const { data, error } = await db
    .from("contributions")
    .insert({
      pool_id: id,
      member_address: memberAddress,
      member_username: memberUsername ?? null,
      amount: amount.toString(),
      tx_hash: txHash,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
