// Auto-sign session management
// InterwovenKit v2.x does not expose a dedicated autoSign API yet.
// We track "approved" sessions locally and use submitTxBlock to skip the fee UI.

const AUTO_SIGN_KEY = "potluck:autosign"

interface AutoSignSession {
  poolId: string
  grantedAt: number
  expiresAt: number
}

function getSessions(): AutoSignSession[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(AUTO_SIGN_KEY) || "[]")
  } catch {
    return []
  }
}

function saveSessions(sessions: AutoSignSession[]) {
  localStorage.setItem(AUTO_SIGN_KEY, JSON.stringify(sessions))
}

/** Grant auto-sign for a potluck (24h duration) */
export function enableAutoSign(poolId: string): void {
  const sessions = getSessions().filter((s) => s.poolId !== poolId)
  sessions.push({
    poolId,
    grantedAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  })
  saveSessions(sessions)
}

/** Revoke auto-sign for a potluck */
export function revokeAutoSign(poolId: string): void {
  saveSessions(getSessions().filter((s) => s.poolId !== poolId))
}

/** Check if auto-sign is active for a potluck */
export function isAutoSignEnabled(poolId: string): boolean {
  const session = getSessions().find((s) => s.poolId === poolId)
  if (!session) return false
  return session.expiresAt > Date.now()
}

/** Remaining ms until expiry, or 0 if expired/not enabled */
export function autoSignExpiresIn(poolId: string): number {
  const session = getSessions().find((s) => s.poolId === poolId)
  if (!session) return 0
  return Math.max(0, session.expiresAt - Date.now())
}

export function formatExpiry(ms: number): string {
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  return `${h}h ${m}m`
}
