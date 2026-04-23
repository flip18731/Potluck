import { DbContribution, DbExpense, DbMember, PoolMember } from "./types"

/**
 * Pure balance calculation — no blockchain calls, fully unit-testable.
 *
 * For each member:
 *   contributed  = sum of their contributions
 *   expenseShare = sum of (expense.amount / split_count) for all expenses they're in
 *   netBalance   = contributed - expenseShare   (positive = they get back, negative = they owe)
 */
export function calcBalances(
  members: DbMember[],
  contributions: DbContribution[],
  expenses: DbExpense[]
): PoolMember[] {
  const contributionMap = new Map<string, bigint>()
  for (const m of members) {
    contributionMap.set(m.address, 0n)
  }
  for (const c of contributions) {
    const prev = contributionMap.get(c.member_address) ?? 0n
    contributionMap.set(c.member_address, prev + BigInt(c.amount))
  }

  const expenseShareMap = new Map<string, bigint>()
  for (const m of members) {
    expenseShareMap.set(m.address, 0n)
  }
  for (const e of expenses) {
    const splitCount = BigInt(e.split_between.length)
    if (splitCount === 0n) continue
    const amountBig = BigInt(e.amount)
    for (const addr of e.split_between) {
      const share = amountBig / splitCount
      const prev = expenseShareMap.get(addr) ?? 0n
      expenseShareMap.set(addr, prev + share)
    }
  }

  return members.map((m) => {
    const contributed = contributionMap.get(m.address) ?? 0n
    const expenseShare = expenseShareMap.get(m.address) ?? 0n
    return {
      address: m.address,
      username: m.username,
      contributed,
      expenseShare,
      netBalance: contributed - expenseShare,
    }
  })
}

/** Returns true if all member balances are >= 0 (table can be cleared) */
export function canClosePool(balances: PoolMember[]): boolean {
  return balances.every((m) => m.netBalance >= 0n)
}

/** Members who still owe money before the table can be cleared */
export function getMembersInDebt(balances: PoolMember[]): PoolMember[] {
  return balances.filter((m) => m.netBalance < 0n)
}

/** Total pool balance on-chain should equal sum of positive net balances */
export function totalSettlementAmount(balances: PoolMember[]): bigint {
  return balances.reduce(
    (acc, m) => (m.netBalance > 0n ? acc + m.netBalance : acc),
    0n
  )
}
