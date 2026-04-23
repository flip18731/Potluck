import { NextRequest, NextResponse } from "next/server"
import { resolveUsername, resolveAddress } from "@/lib/initia/username"

// GET /api/username/resolve?name=alice.init
// GET /api/username/resolve?address=init1abc...
export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name")
  const address = req.nextUrl.searchParams.get("address")

  if (name) {
    const result = await resolveUsername(name)
    if (!result) return NextResponse.json({ error: "Username not found" }, { status: 404 })
    return NextResponse.json({ username: name, address: result })
  }

  if (address) {
    const result = await resolveAddress(address)
    return NextResponse.json({ address, username: result })
  }

  return NextResponse.json({ error: "Provide name or address" }, { status: 400 })
}
