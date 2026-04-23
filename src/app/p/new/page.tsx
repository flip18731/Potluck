"use client"

import { useInterwovenKit } from "@initia/interwovenkit-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { UsernameBadge } from "@/components/identity/UsernameBadge"
import { toast } from "sonner"
import { ChefHat, Plus, X, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

interface MemberEntry {
  input: string
  address: string | null
  username: string | null
  resolving: boolean
  error: string | null
}

export default function NewPotluckPage() {
  const { address, username } = useInterwovenKit()
  const router = useRouter()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [endDate, setEndDate] = useState("")
  const [memberInput, setMemberInput] = useState("")
  const [members, setMembers] = useState<MemberEntry[]>([])
  const [creating, setCreating] = useState(false)

  const resolveAndAdd = async () => {
    if (!memberInput.trim()) return
    const input = memberInput.trim()

    const entry: MemberEntry = { input, address: null, username: null, resolving: true, error: null }
    setMembers((prev) => [...prev, entry])
    setMemberInput("")

    try {
      const res = await fetch(`/api/username/resolve?name=${encodeURIComponent(input)}`)
      if (!res.ok) {
        setMembers((prev) =>
          prev.map((m) =>
            m.input === input ? { ...m, resolving: false, error: "Username not found. They can claim at usernames.testnet.initia.xyz" } : m
          )
        )
        return
      }
      const data = await res.json()
      setMembers((prev) =>
        prev.map((m) =>
          m.input === input
            ? { ...m, address: data.address, username: data.username, resolving: false }
            : m
        )
      )
    } catch {
      setMembers((prev) =>
        prev.map((m) =>
          m.input === input ? { ...m, resolving: false, error: "Could not resolve username" } : m
        )
      )
    }
  }

  const removeMember = (input: string) => {
    setMembers((prev) => prev.filter((m) => m.input !== input))
  }

  const handleCreate = async () => {
    if (!name.trim()) { toast.error("Give your potluck a name"); return }
    if (!address) { toast.error("Connect your account first"); return }

    const resolvedMembers = members.filter((m) => m.address)
    setCreating(true)
    try {
      const res = await fetch("/api/pools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          creatorAddress: address,
          creatorUsername: username || null,
          members: resolvedMembers.map((m) => ({ address: m.address!, username: m.username })),
          denom: "uinit",
          endDate: endDate || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to create potluck")
      }
      const pool = await res.json()
      toast.success("Table is set! Welcome to your potluck.")
      router.push(`/p/${pool.id}`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="bg-white border-b border-zinc-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center">
              <ChefHat className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-zinc-900">Set the table</span>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900">Set the table</h1>
          <p className="text-zinc-500 mt-1">Create a new shared potluck. Everyone brings their share — nobody holds the bag.</p>
        </div>

        <div className="space-y-6">
          {/* Basic info */}
          <Card>
            <CardHeader>
              <CardTitle>Potluck details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Ski Trip 2026, Barcelona August, ..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  placeholder="What's this potluck for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="endDate">End date (optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>

          {/* Members */}
          <Card>
            <CardHeader>
              <CardTitle>Invite guests</CardTitle>
              <CardDescription>
                Add friends by their .init username. You&apos;re already at the table as the host.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Creator */}
              {address && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <UsernameBadge address={address} username={username} size="sm" />
                  <span className="ml-auto text-xs text-emerald-600 font-medium">You (creator)</span>
                </div>
              )}

              {/* Added members */}
              {members.map((m) => (
                <div key={m.input} className={`flex items-center gap-2 p-3 rounded-lg border ${
                  m.error ? "bg-red-50 border-red-200" : m.resolving ? "bg-zinc-50 border-zinc-200" : "bg-white border-zinc-200"
                }`}>
                  {m.resolving ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                      <span className="text-sm text-zinc-500">Resolving {m.input}…</span>
                    </div>
                  ) : m.error ? (
                    <div>
                      <p className="text-sm font-medium text-red-700">{m.input}</p>
                      <p className="text-xs text-red-500">{m.error}</p>
                    </div>
                  ) : (
                    <UsernameBadge address={m.address!} username={m.username} size="sm" />
                  )}
                  <button onClick={() => removeMember(m.input)} className="ml-auto text-zinc-400 hover:text-zinc-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* Add member input */}
              <div className="flex gap-2">
                <Input
                  placeholder="@alice.init"
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && resolveAndAdd()}
                />
                <Button variant="outline" onClick={resolveAndAdd} disabled={!memberInput.trim()}>
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <p className="text-xs text-zinc-400">
                Friend not on Initia yet?{" "}
                <a href="https://usernames.testnet.initia.xyz" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                  Send them here to claim their .init username
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Summary */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
            <p className="font-medium mb-1">What happens next</p>
            <ul className="space-y-1 text-emerald-700">
              <li>• Your potluck is created in the registry</li>
              <li>• Everyone can contribute funds (Bring your share)</li>
              <li>• Add expenses and the plate is automatically passed to whoever paid</li>
              <li>• When ready, Clear the table — everyone gets back what they&apos;re owed</li>
            </ul>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handleCreate}
            disabled={creating || !name.trim()}
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Setting the table…
              </>
            ) : (
              "Set the table"
            )}
          </Button>
        </div>
      </main>
    </div>
  )
}
