"use client"

import { INITIA_TESTNET } from "@/lib/initia/chain"
import { ExternalLink, Copy } from "lucide-react"
import { toast } from "sonner"

interface AddressDetailsProps {
  address: string
  txHash?: string
  label?: string
}

export function AddressDetails({ address, txHash, label }: AddressDetailsProps) {
  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  return (
    <div className="text-xs space-y-1 text-zinc-500">
      {label && <p className="font-medium text-zinc-600">{label}</p>}
      <div className="flex items-center gap-1">
        <span className="font-mono truncate">{address}</span>
        <button onClick={() => copy(address)} className="hover:text-zinc-800">
          <Copy className="h-3 w-3" />
        </button>
        <a
          href={`${INITIA_TESTNET.explorerUrl}/accounts/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-zinc-800"
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      {txHash && (
        <div className="flex items-center gap-1">
          <span className="text-zinc-400">tx:</span>
          <span className="font-mono truncate">{txHash.slice(0, 20)}…</span>
          <a
            href={`${INITIA_TESTNET.explorerUrl}/txs/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-800"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  )
}
