use cosmwasm_schema::cw_serde;
use cosmwasm_std::Uint128;
use cw_storage_plus::{Item, Map};

#[cw_serde]
pub struct Pool {
    pub id: u64,
    pub name: String,
    pub description: String,
    pub creator: String,
    pub members: Vec<String>,
    pub denom: String,
    pub status: PoolStatus,
    pub expense_count: u64,
}

#[cw_serde]
pub enum PoolStatus {
    Open,
    Closed,
}

impl std::fmt::Display for PoolStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            PoolStatus::Open => write!(f, "open"),
            PoolStatus::Closed => write!(f, "closed"),
        }
    }
}

#[cw_serde]
pub struct Expense {
    pub id: u64,
    pub description: String,
    pub amount: Uint128,
    pub paid_by: String,
    pub split_between: Vec<String>,
    pub reimbursed: bool,
    pub timestamp: u64,
}

// Pool counter — increments on each new pool
pub const POOL_COUNT: Item<u64> = Item::new("pool_count");

// pool_id → Pool
pub const POOLS: Map<u64, Pool> = Map::new("pools");

// (pool_id, member_address) → contributed amount in uinit
pub const CONTRIBUTIONS: Map<(u64, &str), Uint128> = Map::new("contributions");

// (pool_id, expense_id) → Expense
pub const EXPENSES: Map<(u64, u64), Expense> = Map::new("expenses");

// member_address → list of pool_ids
pub const MEMBER_POOLS: Map<&str, Vec<u64>> = Map::new("member_pools");
