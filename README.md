# Potluck — Trustless Expense Splitting on Initia

> Share trips. Split fairly. Settle instantly.

Potluck is a group expense splitting app that **actually settles payments** — not just tracks them. Groups create shared "potlucks" (expense pools), contribute real on-chain funds, pay expenses, and receive automatic refunds at settlement. All verified on [InitiaScan](https://scan.testnet.initia.xyz).

## Resolved Network Values

| Parameter | Value |
|-----------|-------|
| Chain ID | `initiation-2` |
| RPC URL | `https://rpc.testnet.initia.xyz` |
| REST URL | `https://rest.testnet.initia.xyz` |
| Explorer | `https://scan.testnet.initia.xyz` |
| Faucet | `https://faucet.testnet.initia.xyz` |
| WasmVM Minitia chain ID | `wasm-1` |
| WasmVM RPC | `https://rpc-wasm-1.anvil.asia-southeast.initia.xyz` |
| WasmVM REST | `https://rest-wasm-1.anvil.asia-southeast.initia.xyz` |
| Fee denom (main) | `uinit` |

## Architecture

### Smart Contract Approach (Primary)

The CosmWasm pool factory contract (`contracts/pool/`) is written and compiles to WASM. It targets `wasm-1` (the public WasmVM Minitia testnet on Initia). Deploy instructions:

```bash
DEPLOYER_KEY=mykey ./scripts/deploy-contract.sh
```

### Treasury Pattern (Fallback — active by default)

Since WasmVM is on a separate Minitia chain (`wasm-1`) while users interact on `initiation-2`, the treasury pattern provides a seamless single-chain UX:

1. **Users send real MsgSend transactions** to the treasury wallet with contributions
2. **Backend verifies invariants** in TypeScript (same rules as the Rust contract)
3. **Backend signs and broadcasts** MsgSend for reimbursements and settlement payouts
4. **Every transfer is on-chain**, verifiable on InitiaScan

This is documented per the spec — the CosmWasm contract version remains the target for a full-chain deployment.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, React 19, Tailwind CSS v4
- **Wallet**: `@initia/interwovenkit-react` v2.8.0 (embedded wallet, Google OAuth)
- **Chain**: Initia testnet (`initiation-2`)
- **Contract**: CosmWasm / Rust targeting `wasm-1` WasmVM Minitia
- **Database**: Supabase (Postgres) — non-critical metadata only
- **State**: TanStack Query (on-chain reads), Zustand (local UI)
- **Deployment**: Vercel

## Setup

### 1. Clone and install

```bash
git clone https://github.com/flip18731/potluck
cd potluck
npm install --legacy-peer-deps
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in:
- `TREASURY_MNEMONIC` — 24-word mnemonic for the treasury wallet
- `NEXT_PUBLIC_TREASURY_ADDRESS` — derived from the mnemonic (run `node scripts/get-treasury-address.mjs`)
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY`

Fund the treasury address with test INIT from the [faucet](https://faucet.testnet.initia.xyz).

### 3. Set up Supabase

Create a Supabase project, then run the migration:
```bash
# In Supabase SQL editor, paste the contents of:
supabase/migrations/001_initial.sql
```

### 4. Run locally

```bash
npm run dev
```

### 5. Deploy CosmWasm contract (optional — treasury fallback works without this)

```bash
# Install minitiad from https://github.com/initia-labs/miniwasm/releases
DEPLOYER_KEY=mykey ./scripts/deploy-contract.sh
# Set NEXT_PUBLIC_POOL_CONTRACT_ADDRESS in .env.local
```

## Deploy to Vercel

```bash
vercel deploy --prod
```

Set all env vars in Vercel dashboard. The `vercel.json` configures build correctly.

## Demo Script — 90 Seconds

For the judging video, run through these steps:

1. **Open** the app fresh in incognito mode
2. Click **"Set the table"** → Google login via InterwovenKit → embedded wallet created
3. **Claim** a `.init` username at `usernames.testnet.initia.xyz` (if not already)
4. **Create a potluck**: name = "Demo Trip 2026", invite 2 test `.init` accounts
5. **Bring your share**: contribute 100 INIT → real MsgSend → InitiaScan link shown in toast
6. **Second account** contributes 100 INIT → balance board updates live
7. **Add expense**: "Dinner — 60 INIT, paid by account 3" → "Passing the plate to @acc3.init" → reimbursement tx fires automatically
8. **Balance board** shows: acc1 +80, acc2 +80, acc3 owes 20
9. **Account 3** contributes 20 more → debts cleared
10. **Clear the table** → backend sends 80 INIT to acc1, 80 INIT to acc2 in a batch tx
11. **Verify on InitiaScan** — click the tx link shown in the toast
12. **Take leftovers home** — click "Take home" → Interwoven Bridge UI opens for cross-chain withdrawal

## File Structure

```
potluck/
├── contracts/pool/               # CosmWasm pool factory (Rust)
│   ├── src/contract.rs           # Core execute/query logic
│   ├── src/state.rs              # On-chain state schema
│   └── src/msg.rs                # Messages + query responses
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── page.tsx              # Landing page
│   │   ├── dashboard/            # User's potluck list
│   │   ├── p/new/                # Create potluck
│   │   ├── p/[id]/               # Potluck detail
│   │   └── api/pools/            # REST API (treasury backend)
│   ├── components/potluck/       # Feature components
│   ├── components/identity/      # UsernameBadge, AddressDetails
│   ├── lib/initia/               # Chain config, treasury, username
│   └── lib/potluck/              # Balance math, types
├── scripts/
│   ├── get-treasury-address.mjs  # Derive treasury address from mnemonic
│   └── deploy-contract.sh        # Deploy CosmWasm to wasm-1
└── supabase/migrations/          # Postgres schema
```

## Test Accounts

Create 3 accounts via InterwovenKit (Google login) and fund each from [faucet](https://faucet.testnet.initia.xyz):
- Each faucet claim gives 100 testnet INIT
- Rate limit: 1 claim per address per 24h

## Known Limitations (MVP)

- Split rule: equal-only (weighted splits in V2)
- Pool close: creator-only (vote-based in V2)
- No partial settlement — all-or-nothing reimbursement
- Usernames use the testnet username app (not on-chain CosmWasm contract query) since the registry contract address isn't publicly documented

## InitiaScan Verification

All transactions include InitiaScan links. Every contribution and settlement payout is a `MsgSend` visible at:
`https://scan.testnet.initia.xyz/txs/{txhash}`

