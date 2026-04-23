"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { InterwovenKitProvider, TESTNET } from "@initia/interwovenkit-react"
import "@initia/interwovenkit-react/styles.css"
import { Toaster } from "sonner"
import { useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
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
      <InterwovenKitProvider
        {...TESTNET}
        defaultChainId={process.env.NEXT_PUBLIC_INITIA_CHAIN_ID || "initiation-2"}
      >
        {children}
        <Toaster position="bottom-right" richColors />
      </InterwovenKitProvider>
    </QueryClientProvider>
  )
}
