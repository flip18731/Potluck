/**
 * Prefix for UI (@anna.init). The connected user's `.init` handle comes from
 * `useInterwovenKit().username` — do not resolve it via a custom REST fetcher.
 */
export function atInitHandle(handle: string | null | undefined): string {
  if (handle == null || handle === "") return ""
  const t = handle.trim()
  if (!t) return ""
  return t.startsWith("@") ? t : `@${t}`
}
