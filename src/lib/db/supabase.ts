import { createClient } from "@supabase/supabase-js"

// Lazy initialization to support build-time without env vars
let _supabase: ReturnType<typeof createClient> | null = null

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return null
  }

  return { url, anonKey }
}

export function getSupabase() {
  if (!_supabase) {
    const config = getSupabaseConfig()
    if (!config) throw new Error("Supabase env vars not configured")
    _supabase = createClient(config.url, config.anonKey)
  }
  return _supabase
}

export function getServiceSupabase() {
  const config = getSupabaseConfig()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!config || !key) throw new Error("Supabase service role not configured")
  return createClient(config.url, key)
}

// Convenience alias
export const supabase = {
  get value() { return getSupabase() }
}
