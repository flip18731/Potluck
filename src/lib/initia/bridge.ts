// Interwoven Bridge helpers — delegates to InterwovenKit's openBridge()

import { INITIA_CHAIN_ID, UINIT_DENOM } from "./chain"

export interface BridgeTarget {
  chainId: string
  chainName: string
  denom: string
}

export const BRIDGE_TARGETS: BridgeTarget[] = [
  { chainId: "wasm-1", chainName: "WasmVM Minitia", denom: UINIT_DENOM },
  { chainId: "evm-1", chainName: "EVM Minitia", denom: UINIT_DENOM },
]

export interface BridgeTransferDetails {
  srcChainId: string
  srcDenom: string
  dstChainId: string
  dstDenom: string
}

export function buildBridgeDetails(
  dstChainId: string,
  dstDenom: string
): BridgeTransferDetails {
  return {
    srcChainId: INITIA_CHAIN_ID,
    srcDenom: UINIT_DENOM,
    dstChainId,
    dstDenom,
  }
}
