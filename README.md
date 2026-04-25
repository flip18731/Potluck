# Potluck

## Share trips. Split fairly. Settle instantly.

Potluck is a group expense app that does more than track IOUs. Instead of leaving friends with unresolved balances and reminders, Potluck moves money as part of the flow so groups can close out a trip with confidence.

## The Problem

Splitwise and Venmo workflows break at the final mile:
- Expenses are recorded, but settlement is manual.
- One person often fronts too much and waits days or weeks to be paid back.
- Group chats become collections queues.
- The social friction is bigger than the math.

In short: tracking is easy, trustless settlement is hard.

## The Solution

Potluck creates a shared group pot on Initia for each trip:
1. Everyone contributes upfront.
2. Expenses are logged as they happen.
3. Reimbursements and final payouts execute through the app.
4. The trip closes with balances settled, not just calculated.

This makes the end state deterministic: no chasing, no ambiguity, no leftover debt.

## Initia Tech Showcase

Potluck is designed as an Initia-native UX demo, focused on speed and composability:

- 100ms-class settlement experience:
  - Contributions and reimbursements are surfaced instantly in-app with on-chain receipts.
- .init Usernames:
  - Members can be discovered and displayed using human-readable Initia identities.
- Auto-Sign flow:
  - One-tap session behavior reduces repeated approval friction and enables popup-light usage.
- Interwoven Bridge handoff:
  - After settlement, users can route leftovers out through the bridge flow for cross-chain withdrawal.

## Architecture

- Frontend: Next.js 16 (App Router), React 19, TypeScript
- Wallet UX: `@initia/interwovenkit-react`
- Backend: Next.js API routes
- Data: Supabase (pool metadata, members, expenses, contributions)
- Settlement model: treasury-backed payout flow with strict balance invariants
- Contract workstream: CosmWasm pool contract under [contracts/pool/](contracts/pool/)

## Local Setup & Deployment

### 1. Install

```bash
npm install --legacy-peer-deps
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill every required variable in [/.env.example](.env.example).

### 3. Database setup

Apply migration from [supabase/migrations/001_initial.sql](supabase/migrations/001_initial.sql) in your Supabase project.

### 4. Run locally

```bash
npm run dev
```

### 5. Production build check

```bash
npm run build
npm run start
```

### 6. Deploy (Vercel)

- Create a Vercel project from this repo.
- Add all environment variables from [/.env.example](.env.example) in Project Settings.
- Deploy from `main`.

## Design Fidelity Audit

The shipped UI implementation follows the provided production HTML specs in [design-spec/](design-spec/) as the source of truth for layout, copy tone, spacing rhythm, palette (Hearth/Cream), and interaction feel. The build intentionally avoids generic off-the-shelf visual language and aligns each core surface to the spec targets, including pool detail, settlement, archive, and modal flows.

## Repository Notes

- Active app routes live under [src/app/](src/app/).
- Potluck feature components live under [src/components/potluck/](src/components/potluck/).
- Initia integration helpers live under [src/lib/initia/](src/lib/initia/).
- Visual progress tracking is documented in [design-spec/build-status.md](design-spec/build-status.md).
