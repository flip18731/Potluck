import { INITIA_TESTNET } from "./chain"

/** Fetch from Initia REST API */
export async function initiaRest<T>(path: string): Promise<T> {
  const res = await fetch(`${INITIA_TESTNET.restUrl}${path}`, {
    next: { revalidate: 10 },
  })
  if (!res.ok) throw new Error(`Initia REST ${path}: ${res.status}`)
  return res.json() as Promise<T>
}

/** Get the INIT balance of an address (returns uinit as bigint) */
export async function getBalance(address: string): Promise<bigint> {
  try {
    const data = await initiaRest<{
      balances: Array<{ denom: string; amount: string }>
    }>(`/cosmos/bank/v1beta1/balances/${address}`)
    const uinit = data.balances.find((b) => b.denom === "uinit")
    return BigInt(uinit?.amount ?? "0")
  } catch {
    return 0n
  }
}

/** Broadcast a pre-signed tx (base64 encoded) */
export async function broadcastTx(txBytes: string): Promise<{ txhash: string }> {
  const res = await fetch(`${INITIA_TESTNET.restUrl}/cosmos/tx/v1beta1/txs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tx_bytes: txBytes, mode: "BROADCAST_MODE_SYNC" }),
  })
  const data = await res.json()
  if (!res.ok || data.tx_response?.code !== 0) {
    throw new Error(data.tx_response?.raw_log || data.message || "Broadcast failed")
  }
  return { txhash: data.tx_response.txhash }
}

/** Subscribe to a block via polling, returns cleanup fn */
export function subscribeToAddress(
  address: string,
  callback: () => void,
  intervalMs = 3000
): () => void {
  const id = setInterval(callback, intervalMs)
  return () => clearInterval(id)
}
