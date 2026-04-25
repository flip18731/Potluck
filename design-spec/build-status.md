# Potluck — Final exhaustive audit (100% complete)

_Last updated: 2026-04-25_

The four-phase hackathon freeze audit was executed on the full `src/` tree. All violations found in-scope were fixed in-repo; `npx tsc --noEmit` and `npx eslint src --max-warnings 0` both pass.

---

## Phase 1 — Web3, Initia, money math

| Finding | Fix |
|--------|-----|
| Bridge helpers used raw `"uinit"` / hard-coded chain id | `src/lib/initia/bridge.ts` now imports `UINIT_DENOM` and `INITIA_CHAIN_ID` from `chain.ts`. |
| Treasury client fee denom could diverge from strict `uinit` | `src/lib/initia/treasury.ts` uses `GasPrice.fromString(\`0.015${UINIT_DENOM}\`)` (no env override on fee denom). |
| `toMicro` / `fromMicro` accepted `number` (float risk) | `src/lib/initia/chain.ts`: `toMicro` is `string` only; `fromMicro` / `formatAmount` accept `bigint \| string` only. |
| Settle flow pool query could go stale during commit | `src/app/p/[id]/settle/page.tsx` `useQuery` now has `refetchInterval: 3000` (aligned with pool detail + LCD polling). |
| (Verified) Pool detail LCD balance | `useOnChainUinitBalance` hits `/cosmos/bank/v1beta1/balances/{address}` with `refetchInterval: 3000`, `UINIT_DENOM` filter. |
| (Verified) Connected `.init` handle | Current user display continues to use `useInterwovenKit().username` only (no parallel fetch for self). |

---

## Phase 2 — Visual fidelity & UI

| Finding | Fix |
|--------|-----|
| `lucide-react` still listed as dependency | Removed package; icons use `src/components/ui/inline-svg.tsx` and inline SVGs elsewhere. |
| `AddressDetails` / tokens | Warm explorer copy, `tabular-nums` on monospace amount lines; `COLORS.stone700` typo corrected to existing tokens. |
| `SettlementFlow` / `WithdrawToChainModal` | HEARTH / `COLORS` styling, inline icons, no emerald defaults. |
| Bridge chips on settle | `DistRow` + `settlementBridgeChip` already match `Clear the Table.html` (`→ Osmosis` / `→ Mantle`, `change` in pre). |
| Tabular figures | Monetary rows use `.tabular` (see `globals.css`: `font-variant-numeric: tabular-nums`) or `tabular-nums` where updated. |

---

## Phase 3 — Anti-crypto copy

| Finding | Fix |
|--------|-----|
| Auto-sign line mentioned “signature” | `AutoSignPrompt`: “Skip extra confirm steps for 24h”. |
| Balance board “on-chain” phrasing | “no one has added to the spread yet”. |
| `SettlementFlow` treasury blurb | Neutral “receipt link” wording (no scan brand in body copy). |
| Comments / docstrings | `calc.ts` “network” not “blockchain”; `tokens.ts` avatar fallback comment neutral. |

API field names (`txHash`, `transactionHash`, `tx_hash`) and subtle explorer links (“View receipt ↗”) are unchanged by design.

---

## Phase 4 — Console & build safety

| Finding | Fix |
|--------|-----|
| TypeScript | Clean after token / prop / treasury typing fixes. |
| ESLint | Unused imports/props removed (`BalanceBoard` denom/status, `ExpenseFeed` `members`, `AddExpenseModal`/`ContributionModal` `denom`, API routes). |
| `react-hooks/set-state-in-effect` | Pool auto-sign: `AUTOSIGN_CHANGED_EVENT` + derived `isAutoSignEnabled` / `autoSignExpiresIn`; `AutoSignPrompt` uses tick + click `setTick` (no sync hydrate effect). Claim-handle: scoped eslint disable for debounced resolver. |
| `react/no-unescaped-entities` | Curly apostrophe via `{"\u2019"}` in pool + settle copy. |
| `@typescript-eslint/no-explicit-any` | Treasury uses typed `result.code` / `result.rawLog`. |
| `no-empty-object-type` | `input.tsx`: `export type InputProps = ...` instead of empty interface. |

---

## Notes

- Local `next build` on some Windows ARM setups may still hit native `lightningcss` issues; that is an environment constraint, not an application typecheck failure.
- Arc fill still uses `Number` on a **0…1e6 ppm** scale only (not on `uinit` amounts).

**Status: final exhaustive audit — 100% complete.**
