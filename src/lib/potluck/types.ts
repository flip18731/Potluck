export type PoolStatus = "open" | "closed"

export interface Pool {
  id: string
  name: string
  description: string | null
  creatorAddress: string
  creatorUsername: string | null
  members: PoolMember[]
  status: PoolStatus
  denom: string
  totalContributed: bigint
  totalExpenses: bigint
  endDate: string | null
  createdAt: string
  contractAddress: string | null
  txHash: string | null
}

export interface PoolMember {
  address: string
  username: string | null
  contributed: bigint
  expenseShare: bigint
  netBalance: bigint
}

export interface Expense {
  id: string
  poolId: string
  description: string
  amount: bigint
  paidByAddress: string
  paidByUsername: string | null
  splitBetween: string[]
  reimbursed: boolean
  reimburseTxHash: string | null
  receiptUrl: string | null
  createdAt: string
}

export interface Contribution {
  id: string
  poolId: string
  memberAddress: string
  memberUsername: string | null
  amount: bigint
  txHash: string
  createdAt: string
}

// DB row shapes (amounts stored as strings to survive JSON)
export interface DbPool {
  id: string
  name: string
  description: string | null
  creator_address: string
  creator_username: string | null
  members: DbMember[]
  status: PoolStatus
  denom: string
  end_date: string | null
  created_at: string
  contract_address: string | null
  treasury_address: string | null
  tx_hash: string | null
}

export interface DbMember {
  address: string
  username: string | null
}

export interface DbExpense {
  id: string
  pool_id: string
  description: string
  amount: string
  paid_by_address: string
  paid_by_username: string | null
  split_between: string[]
  reimbursed: boolean
  reimburse_tx_hash: string | null
  receipt_url: string | null
  created_at: string
}

export interface DbContribution {
  id: string
  pool_id: string
  member_address: string
  member_username: string | null
  amount: string
  tx_hash: string
  created_at: string
}
