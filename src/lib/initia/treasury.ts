// Treasury pattern: backend-controlled wallet signs and broadcasts MsgSend
// Used for reimbursing expenses and settling balances on behalf of the pool.

import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing"
import { SigningStargateClient, GasPrice, coins } from "@cosmjs/stargate"
import { INITIA_TESTNET } from "./chain"

let walletCache: DirectSecp256k1HdWallet | null = null
let clientCache: SigningStargateClient | null = null

function getTreasuryMnemonic() {
  const mnemonic = process.env.TREASURY_MNEMONIC
  if (!mnemonic) {
    throw new Error("TREASURY_MNEMONIC not configured")
  }
  return mnemonic
}

async function getTreasuryClient() {
  if (!walletCache) {
    walletCache = await DirectSecp256k1HdWallet.fromMnemonic(getTreasuryMnemonic(), {
      prefix: INITIA_TESTNET.bech32Prefix,
    })
  }

  if (!clientCache) {
    clientCache = await SigningStargateClient.connectWithSigner(
      INITIA_TESTNET.rpcUrl,
      walletCache,
      { gasPrice: GasPrice.fromString(`0.015${INITIA_TESTNET.feeDenom}`) }
    )
  }

  return { wallet: walletCache, client: clientCache }
}

export async function getTreasuryAddress(): Promise<string> {
  if (process.env.NEXT_PUBLIC_TREASURY_ADDRESS) {
    return process.env.NEXT_PUBLIC_TREASURY_ADDRESS
  }
  const { wallet } = await getTreasuryClient()
  const [account] = await wallet.getAccounts()
  return account.address
}

export async function sendFromTreasury(
  to: string,
  amountUinit: string,
  denom = "uinit"
): Promise<{ txhash: string }> {
  const { wallet, client } = await getTreasuryClient()
  const [account] = await wallet.getAccounts()
  const from = account.address

  const result = await client.sendTokens(from, to, coins(amountUinit, denom), "auto")
  if ((result as any).code !== 0) {
    throw new Error((result as any).rawLog || "Transaction failed")
  }
  return { txhash: result.transactionHash }
}

export async function batchSendFromTreasury(
  transfers: Array<{ to: string; amount: string; denom?: string }>
): Promise<{ txhash: string }> {
  const { wallet, client } = await getTreasuryClient()
  const [account] = await wallet.getAccounts()
  const from = account.address

  const messages = transfers
    .filter((t) => BigInt(t.amount) > 0n)
    .map((t) => ({
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: {
        fromAddress: from,
        toAddress: t.to,
        amount: coins(t.amount, t.denom ?? "uinit"),
      },
    }))

  if (messages.length === 0) {
    return { txhash: "" }
  }

  const result = await client.signAndBroadcast(from, messages, "auto")
  if ((result as any).code !== 0) {
    throw new Error((result as any).rawLog || "Transaction failed")
  }
  return { txhash: result.transactionHash }
}
