"use client"

import { useQuery } from "@tanstack/react-query"
import { INITIA_TESTNET, UINIT_DENOM } from "./chain"

/** GET /cosmos/bank/v1beta1/balances/{address} — live LCD, uinit only */
export async function fetchUinitBalanceMicro(address: string): Promise<bigint> {
  const base = INITIA_TESTNET.lcdUrl.replace(/\/$/, "")
  const res = await fetch(`${base}/cosmos/bank/v1beta1/balances/${address}`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`LCD balances ${res.status}`)
  const json = (await res.json()) as { balances?: Array<{ denom: string; amount: string }> }
  const row = json.balances?.find((b) => b.denom === UINIT_DENOM)
  return BigInt(row?.amount ?? "0")
}

export function useOnChainUinitBalance(
  address: string | undefined,
  options?: { refetchInterval?: number; enabled?: boolean }
) {
  const interval = options?.refetchInterval === undefined ? 2000 : options.refetchInterval
  return useQuery({
    queryKey: ["onchain-uinit-balance", address, INITIA_TESTNET.lcdUrl, UINIT_DENOM],
    queryFn: () => fetchUinitBalanceMicro(address!),
    enabled: (options?.enabled ?? true) && !!address,
    refetchInterval: interval,
  })
}
