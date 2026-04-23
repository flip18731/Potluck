use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Not a member of this potluck")]
    NotMember,

    #[error("Potluck is already closed")]
    PoolClosed,

    #[error("Potluck is still open")]
    PoolStillOpen,

    #[error("Only the creator can close this potluck")]
    Unauthorized,

    #[error("Expense already reimbursed")]
    AlreadyReimbursed,

    #[error("Expense not found")]
    ExpenseNotFound,

    #[error("Outstanding debts must be settled before closing: {debtor} owes {amount}uinit")]
    OutstandingDebt { debtor: String, amount: u128 },

    #[error("Insufficient funds in pool")]
    InsufficientFunds,

    #[error("Must send funds to contribute")]
    NoFunds,

    #[error("Wrong denom: expected {expected}, got {got}")]
    WrongDenom { expected: String, got: String },

    #[error("Pool already exists with id {id}")]
    PoolExists { id: u64 },
}
