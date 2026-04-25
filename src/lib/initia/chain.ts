export const INITIA_TESTNET = {
  chainId: "initiation-2",
  chainName: "Initia Testnet",
  rpcUrl: process.env.NEXT_PUBLIC_INITIA_RPC_URL || "https://rpc.testnet.initia.xyz",
  restUrl: process.env.NEXT_PUBLIC_INITIA_REST_URL || "https://rest.testnet.initia.xyz",
  explorerUrl: "https://scan.testnet.initia.xyz",
  faucetUrl: "https://faucet.testnet.initia.xyz",
  bech32Prefix: "init",
  feeDenom: process.env.NEXT_PUBLIC_FEE_DENOM || "uinit",
  gasPrice: "0.015",
}

export const WASM_MINITIA = {
  chainId: "wasm-1",
  chainName: "Initia WasmVM Testnet",
  rpcUrl: "https://rpc-wasm-1.anvil.asia-southeast.initia.xyz",
  restUrl: "https://rest-wasm-1.anvil.asia-southeast.initia.xyz",
  feeDenom: "l2/8b3e1fc559b327a35335e3f26ff657eaee5ff8486ccd3c1bc59007a93cf23156",
}

export const POOL_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_POOL_CONTRACT_ADDRESS || ""

export const USERNAME_REGISTRY_ADDRESS =
  process.env.NEXT_PUBLIC_USERNAME_REGISTRY_ADDRESS || ""

export const TREASURY_ADDRESS =
  process.env.NEXT_PUBLIC_TREASURY_ADDRESS || ""

// Amount helpers — all on-chain values are in uinit (micro), display in INIT
export const MICRO = 1_000_000n

export function parseMicroAmount(amount: string): bigint | null {
  const normalized = amount.trim()
  if (!/^\d+(\.\d{0,6})?$/.test(normalized)) return null

  const [wholePart, fracPart = ""] = normalized.split(".")
  const whole = BigInt(wholePart)
  const fraction = BigInt(fracPart.padEnd(6, "0") || "0")
  return whole * MICRO + fraction
}

export function toMicro(amount: string | number): bigint {
  const raw = typeof amount === "number" ? amount.toString() : amount
  const parsed = parseMicroAmount(raw)
  if (parsed === null) {
    throw new Error("Invalid amount format")
  }
  return parsed
}

export function fromMicro(uamount: bigint | string | number): string {
  const n = typeof uamount === "bigint" ? uamount : BigInt(uamount.toString())
  const whole = n / MICRO
  const frac = n % MICRO
  if (frac === 0n) return whole.toString()
  return `${whole}.${frac.toString().padStart(6, "0").replace(/0+$/, "")}`
}

export function formatAmount(uamount: bigint | string | number, denom = "INIT"): string {
  return `${fromMicro(uamount)} ${denom}`
}
