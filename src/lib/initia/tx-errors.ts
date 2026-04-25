/** Map SDK / LCD errors to short, demo-friendly toast copy (no raw JSON dumps). */

export function humanizeTxError(e: unknown): string {
  const fallback = "Something went wrong. Please try again."
  if (e == null) return fallback

  const raw = e instanceof Error ? e.message : typeof e === "string" ? e : fallback
  const t = raw.trim()
  if (!t) return fallback
  if (t.length > 400) return fallback
  if (/^\s*[\[{]/.test(t)) return fallback

  const lower = t.toLowerCase()
  if (lower.includes("insufficient funds") || lower.includes("spendable balance")) {
    return "Not enough INIT in your account for this."
  }
  if (lower.includes("rejected") || lower.includes("denied") || lower.includes("user denied") || lower.includes("cancel")) {
    return "You cancelled the confirm step."
  }
  if (lower.includes("timeout") || lower.includes("timed out")) {
    return "The request timed out. Try again."
  }
  if (/status (code )?4\d\d/.test(lower) || lower.includes("request failed")) {
    return "We could not reach the network. Try again."
  }

  const stripped = t.replace(/^.*failed to execute message[^:]*:\s*/i, "").trim()
  if (stripped.length > 0 && stripped.length < 200) return stripped

  return t.length < 200 ? t : fallback
}
