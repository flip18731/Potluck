// Interwoven Bridge helpers — delegates to InterwovenKit's openBridge()

export interface BridgeTarget {
  chainId: string
  chainName: string
  denom: string
}

export const BRIDGE_TARGETS: BridgeTarget[] = [
  { chainId: "wasm-1", chainName: "WasmVM Minitia", denom: "uinit" },
  { chainId: "evm-1", chainName: "EVM Minitia", denom: "uinit" },
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
    srcChainId: "initiation-2",
    srcDenom: "uinit",
    dstChainId,
    dstDenom,
  }
}
