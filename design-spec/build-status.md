# Potluck Build Status — Post-Survey

_Last updated: current session_

---

## ✅ Complete

| Item | File | Status |
|------|------|--------|
| Design tokens | `src/lib/design/tokens.ts` | ✅ Full hearth/cream/avatar palette |
| globals.css | `src/app/globals.css` | ✅ DM Sans, all keyframes, `.tabular`, `.field-input`, etc. |
| layout.tsx | `src/app/layout.tsx` | ✅ DM Sans, correct metadata |
| Avatar + AvatarStack | `src/components/ui/Avatar.tsx` | ✅ Matches design |
| Arc | `src/components/ui/Arc.tsx` | ✅ Matches spec |
| CTABtn | `src/components/ui/CTABtn.tsx` | ✅ primary/ghost/dark variants |
| AppNav + OneTapPill | `src/components/chrome/AppNav.tsx` | ✅ Matches spec |
| LandingPage | `src/components/potluck/LandingPage.tsx` | ✅ Rewritten (using CTABtn) |
| claim-handle page | `src/app/claim-handle/page.tsx` | ✅ Created with debounce + on-chain claim |
| Dashboard | `src/app/dashboard/page.tsx` | ✅ Rewritten with design tokens (useState fixed) |
| Create potluck | `src/app/p/new/page.tsx` | ✅ Rewritten with design tokens |
| BalanceBoard | `src/components/potluck/BalanceBoard.tsx` | ✅ Rewritten (Arc + Avatar + MemberRow pattern) |
| public/design-spec | `public/design-spec/*.html` | ✅ Copied |
| extracted-tokens.md | `design-spec/extracted-tokens.md` | ✅ Full extraction |

---

## ⚠️ Partial / Needs Work

| Item | File | What's missing |
|------|------|----------------|
| Pool detail page | `src/app/p/[id]/page.tsx` | **Still old design** — uses lucide, shadcn Button/Badge/Separator, UsernameBadge. Full rewrite needed. |
| ExpenseFeed | `src/components/potluck/ExpenseFeed.tsx` | Still uses `UsernameBadge`, `Badge` (shadcn), `Clock/Receipt/ArrowUpRight` lucide icons |
| ContributionModal | `src/components/potluck/ContributionModal.tsx` | Still uses shadcn Dialog/Button/Input/Label, Loader2/Wallet lucide |
| AddExpenseModal | `src/components/potluck/AddExpenseModal.tsx` | Still uses shadcn Dialog/Button/Input/Label, UsernameBadge, lucide |
| AutoSignPrompt | `src/components/potluck/AutoSignPrompt.tsx` | Still uses shadcn Button, lucide Zap/ZapOff |
| SettlementFlow | `src/components/potluck/SettlementFlow.tsx` | Still uses shadcn Dialog/Button, lucide, WithdrawToChainModal |

---

## ❌ Not Started

| Item | File | Notes |
|------|------|-------|
| Settle page | `src/app/p/[id]/settle/page.tsx` | Directory exists but empty. Must match Clear_the_Table.html exactly. |
| Archive page | `src/app/p/[id]/archive/page.tsx` | Functional but still old visual design — needs rewrite |

---

## 🐛 Known Issues

- Pool detail `p/[id]/page.tsx` uses `ChefHat, ArrowLeft, ExternalLink, RefreshCw, Copy, CheckCircle2` from lucide, `Button, Badge, Separator` from shadcn, `UsernameBadge, AddressDetails` — all inconsistent with design system
- ExpenseFeed imports `Badge` from `@/components/ui/badge` (shadcn custom) and lucide icons
- The shadcn `dialog.tsx` is still used by modals — need to decide: keep native Dialog (it's functional) or replace with custom overlay
- `BalanceBoard` passes `poolStatus` as `_poolStatus` (unused) — can clean up
- `SettlementFlow` component still exists and is used in pool detail — should be replaced by the new `settle/page.tsx` route

---

## Priority Order for This Session

1. **Pool detail page** `p/[id]/page.tsx` — highest visual impact for judges
2. **ExpenseFeed** — needed by pool detail
3. **Settle page** `p/[id]/settle/page.tsx` — second-highest visual impact
4. **ContributionModal** + inline contribution card
5. **AddExpenseModal**
6. **AutoSignPrompt** — minor
7. **Archive page** — minor polish
8. Build, commit, push
