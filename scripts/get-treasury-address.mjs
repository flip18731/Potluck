/**
 * Derives the treasury address from TREASURY_MNEMONIC.
 * Usage: TREASURY_MNEMONIC="word1 word2 ..." node scripts/get-treasury-address.mjs
 */
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing"

const mnemonic = process.env.TREASURY_MNEMONIC
if (!mnemonic) {
  console.error("Set TREASURY_MNEMONIC env var")
  process.exit(1)
}

const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: "init" })
const [account] = await wallet.getAccounts()
console.log("Treasury address:", account.address)
console.log("")
console.log("Add to .env:")
console.log(`NEXT_PUBLIC_TREASURY_ADDRESS=${account.address}`)
