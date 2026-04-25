"use client"

import { useEffect, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  InterwovenKitProvider,
  TESTNET,
  initiaPrivyWalletConnector,
  injectStyles,
} from "@initia/interwovenkit-react"
import InterwovenKitStyles from "@initia/interwovenkit-react/styles.js"
import { createConfig, http, WagmiProvider } from "wagmi"
import { mainnet } from "wagmi/chains"
import { Toaster } from "sonner"
import { INITIA_CHAIN_ID } from "@/lib/initia/chain"

const wagmiConfig = createConfig({
  connectors: [initiaPrivyWalletConnector],
  chains: [mainnet],
  transports: { [mainnet.id]: http() },
})

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    injectStyles(InterwovenKitStyles)
  }, [])

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10_000,
        refetchInterval: 10_000,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <InterwovenKitProvider
          {...TESTNET}
          defaultChainId={process.env.NEXT_PUBLIC_INITIA_CHAIN_ID ?? INITIA_CHAIN_ID}
          /* Demo: one-tap for pot contributions (MsgSend) + optional pool contract close (MsgExecuteContract). */
          enableAutoSign={{
            [INITIA_CHAIN_ID]: [
              "/cosmos.bank.v1beta1.MsgSend",
              "/cosmwasm.wasm.v1.MsgExecuteContract",
            ],
          }}
        >
          {children}
          <Toaster position="bottom-right" richColors />
        </InterwovenKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}
