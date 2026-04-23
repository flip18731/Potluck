"use client"

import { useInterwovenKit } from "@initia/interwovenkit-react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UsernameBadge } from "@/components/identity/UsernameBadge"
import { formatAmount, fromMicro } from "@/lib/initia/chain"
import { ChefHat, Plus, ExternalLink, Clock } from "lucide-react"
import Link from "next/link"
import { DbPool } from "@/lib/potluck/types"
import { formatDistanceToNow } from "date-fns"

function useMyPotlucks(address: string | undefined) {
  return useQuery({
    queryKey: ["pools", address],
    queryFn: async () => {
      if (!address) return []
      const res = await fetch(`/api/pools?member=${address}`)
      if (!res.ok) throw new Error("Failed to load potlucks")
      return res.json() as Promise<DbPool[]>
    },
    enabled: !!address,
    refetchInterval: 8000,
  })
}

export default function DashboardPage() {
  const { address, username, openConnect } = useInterwovenKit()
  const router = useRouter()
  const { data: pools, isLoading } = useMyPotlucks(address)

  useEffect(() => {
    if (!address) openConnect()
  }, [address, openConnect])

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Nav */}
      <nav className="bg-white border-b border-zinc-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center">
              <ChefHat className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-zinc-900">Potluck</span>
          </Link>
          <div className="flex items-center gap-3">
            {address && (
              <UsernameBadge address={address} username={username} size="sm" />
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Your potlucks</h1>
            <p className="text-zinc-500 mt-1">
              {address ? `Signed in as ${username || address.slice(0, 12) + "…"}` : "Connect to see your potlucks"}
            </p>
          </div>
          <Button onClick={() => router.push("/p/new")}>
            <Plus className="h-4 w-4" />
            Set the table
          </Button>
        </div>

        {/* Pool list */}
        {!address && (
          <div className="text-center py-16">
            <ChefHat className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-zinc-700 mb-2">Connect your account</h2>
            <p className="text-zinc-500 mb-6">Sign in with Google to see your potlucks</p>
            <Button onClick={openConnect}>Connect account</Button>
          </div>
        )}

        {address && isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-zinc-100 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {address && !isLoading && (!pools || pools.length === 0) && (
          <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
            <ChefHat className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-zinc-700 mb-2">
              No potlucks yet — set your first table!
            </h2>
            <p className="text-zinc-500 mb-6 max-w-sm mx-auto">
              Create a potluck and invite your friends. Everyone brings their share; at the end, everyone takes home what&apos;s theirs.
            </p>
            <Button onClick={() => router.push("/p/new")}>
              <Plus className="h-4 w-4" />
              Set the table
            </Button>
          </div>
        )}

        {pools && pools.length > 0 && (
          <div className="space-y-3">
            {pools.map((pool) => (
              <Link key={pool.id} href={`/p/${pool.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-zinc-900 truncate">{pool.name}</h3>
                          <Badge variant={pool.status === "open" ? "default" : "secondary"}>
                            {pool.status === "open" ? "Open" : "Cleared"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(pool.created_at), { addSuffix: true })}
                          </span>
                          <span>{(pool.members as Array<{ address: string }>).length} guests</span>
                          {pool.description && (
                            <span className="truncate max-w-xs">{pool.description}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <ExternalLink className="h-4 w-4 text-zinc-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
