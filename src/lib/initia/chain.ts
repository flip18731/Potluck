/** Live Initia testnet — initiation-2 (no mock endpoints). */
export const INITIA_CHAIN_ID = "initiation-2" as const

/** Primary on-chain denom for initiation-2 bank sends (strict). */
export const UINIT_DENOM = "uinit" as const

/** 1 INIT = 1_000_000 uinit; use bigint uinit in logic, INIT in UI via fromMicro/formatAmount */
export const INITIA_TESTNET = {
  chainId: INITIA_CHAIN_ID,
  chainName: "Initia Testnet",
  rpcUrl: process.env.NEXT_PUBLIC_INITIA_RPC_URL || "https://rpc.testnet.initia.xyz",
  /** LCD (REST) — bank balances, txs, modules */
  lcdUrl: process.env.NEXT_PUBLIC_INITIA_LCD_URL || "https://lcd.testnet.initia.xyz",
  restUrl: process.env.NEXT_PUBLIC_INITIA_LCD_URL || process.env.NEXT_PUBLIC_INITIA_REST_URL || "https://lcd.testnet.initia.xyz",
  explorerUrl: "https://scan.testnet.initia.xyz",
  faucetUrl: process.env.NEXT_PUBLIC_INITIA_FAUCET_URL || "https://faucet.testnet.initia.xyz",
  bech32Prefix: "init",
  feeDenom: process.env.NEXT_PUBLIC_FEE_DENOM || UINIT_DENOM,
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

export function toMicro(amount: string): bigint {
  const parsed = parseMicroAmount(amount)
  if (parsed === null) {
    throw new Error("Invalid amount format")
  }
  return parsed
}

export function fromMicro(uamount: bigint | string): string {
  const n = typeof uamount === "bigint" ? uamount : BigInt(uamount)
  const whole = n / MICRO
  const frac = n % MICRO
  if (frac === 0n) return whole.toString()
  return `${whole}.${frac.toString().padStart(6, "0").replace(/0+$/, "")}`
}

export function formatAmount(uamount: bigint | string, denom = "INIT"): string {
  return `${fromMicro(uamount)} ${denom}`
}
