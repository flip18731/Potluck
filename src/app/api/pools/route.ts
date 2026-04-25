import { NextRequest, NextResponse } from "next/server"
import { getServiceSupabase } from "@/lib/db/supabase"
import { DbPool } from "@/lib/potluck/types"

// GET /api/pools?member=<address>
export async function GET(req: NextRequest) {
  const member = req.nextUrl.searchParams.get("member")
  const db = getServiceSupabase()

  let query = db
    .from("pools")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  if (member) {
    // Use raw filter for JSONB array containment – checks if any element has this address
    query = query.filter("members", "cs", `[{"address":"${member}"}]`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/pools — create a new pool (treasury pattern)
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, members, denom, creatorAddress, creatorUsername, endDate, txHash } = body

  if (!name || !creatorAddress) {
    return NextResponse.json({ error: "name and creatorAddress required" }, { status: 400 })
  }

  const db = getServiceSupabase()

  // Build member list — creator is always first
  const seen = new Set<string>()
  const allMembers: Array<{ address: string; username: string | null }> = []

  // Creator always included first
  allMembers.push({ address: creatorAddress, username: creatorUsername ?? null })
  seen.add(creatorAddress)

  for (const m of (members ?? [])) {
    if (!seen.has(m.address)) {
      allMembers.push({ address: m.address, username: m.username ?? null })
      seen.add(m.address)
    }
  }

  const { data, error } = await db
    .from("pools")
    .insert({
      name,
      description: description ?? null,
      creator_address: creatorAddress,
      creator_username: creatorUsername ?? null,
      members: allMembers,
      denom: denom ?? "uinit",
      end_date: endDate ?? null,
      tx_hash: txHash ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
