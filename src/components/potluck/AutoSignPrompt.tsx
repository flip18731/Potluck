"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  enableAutoSign, isAutoSignEnabled, autoSignExpiresIn, revokeAutoSign, formatExpiry
} from "@/lib/initia/autosign"
import { Zap, ZapOff } from "lucide-react"

interface AutoSignPromptProps {
  poolId: string
}

export function AutoSignPrompt({ poolId }: AutoSignPromptProps) {
  const [enabled, setEnabled] = useState(false)
  const [expiresIn, setExpiresIn] = useState(0)

  useEffect(() => {
    setEnabled(isAutoSignEnabled(poolId))
    setExpiresIn(autoSignExpiresIn(poolId))
    const interval = setInterval(() => {
      setEnabled(isAutoSignEnabled(poolId))
      setExpiresIn(autoSignExpiresIn(poolId))
    }, 30_000)
    return () => clearInterval(interval)
  }, [poolId])

  if (enabled) {
    return (
      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <Zap className="h-4 w-4 text-emerald-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-emerald-800">One-tap approval active</p>
          <p className="text-xs text-emerald-600">
            Approve expenses without popups • Expires in {formatExpiry(expiresIn)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { revokeAutoSign(poolId); setEnabled(false) }}
          className="text-emerald-700 hover:text-emerald-900"
        >
          <ZapOff className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-xl p-4">
      <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
        <Zap className="h-4 w-4 text-zinc-400" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-zinc-700">Enable one-tap approval</p>
        <p className="text-xs text-zinc-500">
          Approve expenses and contributions without signature popups for 24 hours
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => { enableAutoSign(poolId); setEnabled(true); setExpiresIn(24 * 60 * 60 * 1000) }}
      >
        Enable
      </Button>
    </div>
  )
}
