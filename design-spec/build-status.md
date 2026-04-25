# Potluck Build Status — Production UI Pass

_Last updated: 2026-04-25_

---

## ✅ Completed In This Pass

| Task | File | Result |
|------|------|--------|
| Money input bug fixed (no float parsing in contribution flow) | `src/app/p/[id]/page.tsx` | ✅ Amount validation and conversion now use `BigInt` micro-units via `parseMicroAmount`; no `parseFloat` / `toFixed` money math |
| Missing bridge routing chips added | `src/app/p/[id]/settle/page.tsx` | ✅ `DistRow` now renders route chips (`→ Osmosis` / `→ Mantle`) and `change` affordance in pre-commit state |
| Mobile visibility bug fixed | `src/components/potluck/BalanceBoard.tsx` + `src/app/globals.css` | ✅ Brought column now uses `mobile-hidden` and is hidden on screens `<768px` |
| Expense feed visual rewrite | `src/components/potluck/ExpenseFeed.tsx` | ✅ Feed rows aligned to spec typography/spacing; no lucide usage; tabular amount treatment preserved |
| Contribution modal finalized | `src/components/potluck/ContributionModal.tsx` | ✅ Custom modal styling (no generic dialog look), Hearth register preserved, no float math |
| Add expense modal finalized | `src/components/potluck/AddExpenseModal.tsx` | ✅ Custom modal styling (no generic dialog look), no float money math |
| Archive page rewrite | `src/app/p/[id]/archive/page.tsx` | ✅ Now matches active-page structure with archived state and disabled actions |
| Core amount helper hardened | `src/lib/initia/chain.ts` | ✅ `toMicro` replaced with safe parser-backed BigInt conversion (`parseMicroAmount`) |

---

## ✅ Acceptance Checks

- Hearth accent usage: consistent in transactional controls, chips, and action emphasis.
- Money formatting: values displayed through `fromMicro`/tabular figures; no float-based money conversion in updated flows.
- Crypto jargon: removed from updated modal/action copy in the touched surfaces.

---

## Notes

- This status reflects the critical bug fixes and component completions requested for Task 1 and Task 2.
