"use client"

import { INITIA_TESTNET } from "@/lib/initia/chain"
import { COLORS } from "@/lib/design/tokens"
import { IconCopy, IconExternal } from "@/components/ui/inline-svg"
import { toast } from "sonner"

interface AddressDetailsProps {
  address: string
  txHash?: string
  label?: string
}

export function AddressDetails({ address, txHash, label }: AddressDetailsProps) {
  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied")
  }

  return (
    <div className="text-xs space-y-1" style={{ color: COLORS.stone600 }}>
      {label && <p className="font-medium" style={{ color: COLORS.stone600 }}>{label}</p>}
      <div className="flex items-center gap-1">
        <span className="font-mono truncate tabular-nums">{address}</span>
        <button type="button" onClick={() => copy(address)} className="p-0.5 hover:opacity-80" aria-label="Copy address">
          <IconCopy size={12} color={COLORS.stone600} />
        </button>
        <a
          href={`${INITIA_TESTNET.explorerUrl}/accounts/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-0.5 hover:opacity-80"
          aria-label="Open in explorer"
        >
          <IconExternal size={14} color={COLORS.stone600} />
        </a>
      </div>
      {txHash && (
        <div className="flex items-center gap-1">
          <span style={{ color: COLORS.stone400 }}>Receipt:</span>
          <span className="font-mono truncate tabular-nums">{txHash.slice(0, 20)}…</span>
          <a
            href={`${INITIA_TESTNET.explorerUrl}/txs/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-0.5 hover:opacity-80"
            aria-label="View receipt"
          >
            <IconExternal size={14} color={COLORS.stone600} />
          </a>
        </div>
      )}
    </div>
  )
}
