use cosmwasm_schema::{cw_serde, QueryResponses};
use cosmwasm_std::Uint128;

#[cw_serde]
pub struct InstantiateMsg {}

#[cw_serde]
pub enum ExecuteMsg {
    CreatePool {
        name: String,
        description: String,
        members: Vec<String>,
        denom: String,
    },
    Contribute {
        pool_id: u64,
    },
    AddExpense {
        pool_id: u64,
        description: String,
        amount: Uint128,
        paid_by: String,
        split_between: Vec<String>,
    },
    ReimburseFromPool {
        pool_id: u64,
        expense_id: u64,
    },
    ClosePool {
        pool_id: u64,
    },
}

#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {
    #[returns(PoolResponse)]
    GetPool { pool_id: u64 },

    #[returns(MemberBalanceResponse)]
    GetMemberBalance { pool_id: u64, member: String },

    #[returns(PoolsForMemberResponse)]
    ListPoolsForMember { member: String },

    #[returns(BalanceBoardResponse)]
    GetBalanceBoard { pool_id: u64 },
}

#[cw_serde]
pub struct PoolResponse {
    pub id: u64,
    pub name: String,
    pub description: String,
    pub creator: String,
    pub members: Vec<String>,
    pub contributions: Vec<(String, Uint128)>,
    pub expenses: Vec<ExpenseResponse>,
    pub status: String,
    pub denom: String,
    pub total_contributed: Uint128,
}

#[cw_serde]
pub struct ExpenseResponse {
    pub id: u64,
    pub description: String,
    pub amount: Uint128,
    pub paid_by: String,
    pub split_between: Vec<String>,
    pub reimbursed: bool,
    pub timestamp: u64,
}

#[cw_serde]
pub struct MemberBalanceResponse {
    pub member: String,
    pub contributed: Uint128,
    pub expense_share: Uint128,
    pub net_balance: i128,
}

#[cw_serde]
pub struct PoolsForMemberResponse {
    pub pool_ids: Vec<u64>,
}

#[cw_serde]
pub struct BalanceBoardResponse {
    pub balances: Vec<MemberBalanceResponse>,
    pub can_close: bool,
}
