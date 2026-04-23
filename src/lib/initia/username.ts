import { INITIA_TESTNET } from "./chain"

const REST = INITIA_TESTNET.restUrl

/** Resolve .init username → address via Initia REST (move module) */
export async function resolveUsername(username: string): Promise<string | null> {
  try {
    // Initia usernames are stored as Move resources on-chain.
    // The REST endpoint for reverse lookup:
    const name = username.replace(/\.init$/i, "")
    const res = await fetch(
      `${REST}/initia/move/v1/accounts/0x1/resources/by_module?module_name=usernames`,
      { cache: "no-store" }
    )
    if (!res.ok) return null
    // Fallback: query the usernames app directly
    const lookup = await fetch(
      `https://usernames.testnet.initia.xyz/api/name/${encodeURIComponent(name)}`,
      { cache: "no-store" }
    )
    if (!lookup.ok) return null
    const data = await lookup.json()
    return data?.address ?? null
  } catch {
    return null
  }
}

/** Resolve address → .init username */
export async function resolveAddress(address: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://usernames.testnet.initia.xyz/api/address/${address}`,
      { cache: "no-store" }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data?.username ? `${data.username}.init` : null
  } catch {
    return null
  }
}

export function formatIdentity(address: string, username: string | null): string {
  if (username) return username.endsWith(".init") ? username : `${username}.init`
  return `${address.slice(0, 8)}...${address.slice(-4)}`
}
