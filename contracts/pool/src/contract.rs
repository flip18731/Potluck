#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;

use cosmwasm_std::{
    to_json_binary, BankMsg, Binary, Coin, Deps, DepsMut, Env, MessageInfo, Response, StdResult,
    Uint128,
};

use crate::error::ContractError;
use crate::msg::{
    BalanceBoardResponse, ExecuteMsg, ExpenseResponse, InstantiateMsg, MemberBalanceResponse,
    PoolResponse, PoolsForMemberResponse, QueryMsg,
};
use crate::state::{Expense, Pool, PoolStatus, CONTRIBUTIONS, EXPENSES, MEMBER_POOLS, POOL_COUNT, POOLS};

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    _msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    POOL_COUNT.save(deps.storage, &0u64)?;
    Ok(Response::new().add_attribute("action", "instantiate"))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::CreatePool { name, description, members, denom } =>
            execute_create_pool(deps, env, info, name, description, members, denom),
        ExecuteMsg::Contribute { pool_id } =>
            execute_contribute(deps, env, info, pool_id),
        ExecuteMsg::AddExpense { pool_id, description, amount, paid_by, split_between } =>
            execute_add_expense(deps, env, info, pool_id, description, amount, paid_by, split_between),
        ExecuteMsg::ReimburseFromPool { pool_id, expense_id } =>
            execute_reimburse(deps, env, info, pool_id, expense_id),
        ExecuteMsg::ClosePool { pool_id } =>
            execute_close_pool(deps, env, info, pool_id),
    }
}

fn execute_create_pool(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    name: String,
    description: String,
    members: Vec<String>,
    denom: String,
) -> Result<Response, ContractError> {
    let mut all_members = members.clone();
    let creator = info.sender.to_string();
    if !all_members.contains(&creator) {
        all_members.insert(0, creator.clone());
    }

    let pool_id = POOL_COUNT.load(deps.storage)? + 1;
    POOL_COUNT.save(deps.storage, &pool_id)?;

    let pool = Pool {
        id: pool_id,
        name: name.clone(),
        description,
        creator: creator.clone(),
        members: all_members.clone(),
        denom,
        status: PoolStatus::Open,
        expense_count: 0,
    };
    POOLS.save(deps.storage, pool_id, &pool)?;

    for member in &all_members {
        CONTRIBUTIONS.save(deps.storage, (pool_id, member.as_str()), &Uint128::zero())?;
        let mut pools = MEMBER_POOLS
            .may_load(deps.storage, member.as_str())?
            .unwrap_or_default();
        pools.push(pool_id);
        MEMBER_POOLS.save(deps.storage, member.as_str(), &pools)?;
    }

    Ok(Response::new()
        .add_attribute("action", "create_pool")
        .add_attribute("pool_id", pool_id.to_string())
        .add_attribute("creator", creator)
        .add_attribute("name", name))
}

fn execute_contribute(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    pool_id: u64,
) -> Result<Response, ContractError> {
    let pool = POOLS.load(deps.storage, pool_id)?;
    if matches!(pool.status, PoolStatus::Closed) {
        return Err(ContractError::PoolClosed);
    }

    let sender = info.sender.to_string();
    if !pool.members.contains(&sender) {
        return Err(ContractError::NotMember);
    }

    if info.funds.is_empty() {
        return Err(ContractError::NoFunds);
    }

    let fund = info.funds.iter().find(|c| c.denom == pool.denom)
        .ok_or(ContractError::WrongDenom {
            expected: pool.denom.clone(),
            got: info.funds.first().map(|c| c.denom.clone()).unwrap_or_default(),
        })?;

    let current = CONTRIBUTIONS.load(deps.storage, (pool_id, sender.as_str()))?;
    CONTRIBUTIONS.save(deps.storage, (pool_id, sender.as_str()), &(current + fund.amount))?;

    Ok(Response::new()
        .add_attribute("action", "contribute")
        .add_attribute("pool_id", pool_id.to_string())
        .add_attribute("member", sender)
        .add_attribute("amount", fund.amount))
}

fn execute_add_expense(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    pool_id: u64,
    description: String,
    amount: Uint128,
    paid_by: String,
    split_between: Vec<String>,
) -> Result<Response, ContractError> {
    let mut pool = POOLS.load(deps.storage, pool_id)?;
    if matches!(pool.status, PoolStatus::Closed) {
        return Err(ContractError::PoolClosed);
    }

    let sender = info.sender.to_string();
    if !pool.members.contains(&sender) {
        return Err(ContractError::NotMember);
    }

    if !pool.members.contains(&paid_by) {
        return Err(ContractError::NotMember);
    }

    let expense_id = pool.expense_count + 1;
    pool.expense_count = expense_id;
    POOLS.save(deps.storage, pool_id, &pool)?;

    let expense = Expense {
        id: expense_id,
        description,
        amount,
        paid_by: paid_by.clone(),
        split_between,
        reimbursed: false,
        timestamp: env.block.time.seconds(),
    };
    EXPENSES.save(deps.storage, (pool_id, expense_id), &expense)?;

    Ok(Response::new()
        .add_attribute("action", "add_expense")
        .add_attribute("pool_id", pool_id.to_string())
        .add_attribute("expense_id", expense_id.to_string())
        .add_attribute("paid_by", paid_by)
        .add_attribute("amount", amount))
}

fn execute_reimburse(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    pool_id: u64,
    expense_id: u64,
) -> Result<Response, ContractError> {
    let pool = POOLS.load(deps.storage, pool_id)?;
    if matches!(pool.status, PoolStatus::Closed) {
        return Err(ContractError::PoolClosed);
    }

    let sender = info.sender.to_string();
    if !pool.members.contains(&sender) {
        return Err(ContractError::NotMember);
    }

    let mut expense = EXPENSES
        .may_load(deps.storage, (pool_id, expense_id))?
        .ok_or(ContractError::ExpenseNotFound)?;

    if expense.reimbursed {
        return Err(ContractError::AlreadyReimbursed);
    }

    expense.reimbursed = true;
    EXPENSES.save(deps.storage, (pool_id, expense_id), &expense)?;

    let msg = BankMsg::Send {
        to_address: expense.paid_by.clone(),
        amount: vec![Coin {
            denom: pool.denom,
            amount: expense.amount,
        }],
    };

    Ok(Response::new()
        .add_message(msg)
        .add_attribute("action", "reimburse")
        .add_attribute("pool_id", pool_id.to_string())
        .add_attribute("expense_id", expense_id.to_string())
        .add_attribute("recipient", expense.paid_by)
        .add_attribute("amount", expense.amount))
}

fn execute_close_pool(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    pool_id: u64,
) -> Result<Response, ContractError> {
    let mut pool = POOLS.load(deps.storage, pool_id)?;
    if matches!(pool.status, PoolStatus::Closed) {
        return Err(ContractError::PoolClosed);
    }

    if info.sender.to_string() != pool.creator {
        return Err(ContractError::Unauthorized);
    }

    // Calculate balances and ensure no member is in debt
    let mut messages: Vec<BankMsg> = vec![];
    for member in &pool.members {
        let contributed = CONTRIBUTIONS
            .load(deps.storage, (pool_id, member.as_str()))
            .unwrap_or(Uint128::zero());

        let expense_share = (0..pool.expense_count + 1)
            .filter_map(|eid| EXPENSES.may_load(deps.storage, (pool_id, eid)).ok().flatten())
            .filter(|e| e.split_between.contains(member))
            .map(|e| e.amount.u128() / e.split_between.len() as u128)
            .sum::<u128>();

        let net = contributed.u128() as i128 - expense_share as i128;

        if net < 0 {
            return Err(ContractError::OutstandingDebt {
                debtor: member.clone(),
                amount: (-net) as u128,
            });
        }

        if net > 0 {
            messages.push(BankMsg::Send {
                to_address: member.clone(),
                amount: vec![Coin {
                    denom: pool.denom.clone(),
                    amount: Uint128::from(net as u128),
                }],
            });
        }
    }

    pool.status = PoolStatus::Closed;
    POOLS.save(deps.storage, pool_id, &pool)?;

    let mut response = Response::new()
        .add_attribute("action", "close_pool")
        .add_attribute("pool_id", pool_id.to_string());

    for msg in messages {
        response = response.add_message(msg);
    }

    Ok(response)
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetPool { pool_id } => to_json_binary(&query_pool(deps, pool_id)?),
        QueryMsg::GetMemberBalance { pool_id, member } =>
            to_json_binary(&query_member_balance(deps, pool_id, &member)?),
        QueryMsg::ListPoolsForMember { member } =>
            to_json_binary(&query_pools_for_member(deps, &member)?),
        QueryMsg::GetBalanceBoard { pool_id } =>
            to_json_binary(&query_balance_board(deps, pool_id)?),
    }
}

fn query_pool(deps: Deps, pool_id: u64) -> StdResult<PoolResponse> {
    let pool = POOLS.load(deps.storage, pool_id)?;

    let contributions: Vec<(String, Uint128)> = pool
        .members
        .iter()
        .map(|m| {
            let amount = CONTRIBUTIONS
                .load(deps.storage, (pool_id, m.as_str()))
                .unwrap_or(Uint128::zero());
            (m.clone(), amount)
        })
        .collect();

    let total_contributed = contributions.iter().map(|(_, a)| a.u128()).sum::<u128>();

    let expenses: Vec<ExpenseResponse> = (1..=pool.expense_count)
        .filter_map(|eid| EXPENSES.may_load(deps.storage, (pool_id, eid)).ok().flatten())
        .map(|e| ExpenseResponse {
            id: e.id,
            description: e.description,
            amount: e.amount,
            paid_by: e.paid_by,
            split_between: e.split_between,
            reimbursed: e.reimbursed,
            timestamp: e.timestamp,
        })
        .collect();

    Ok(PoolResponse {
        id: pool.id,
        name: pool.name,
        description: pool.description,
        creator: pool.creator,
        members: pool.members,
        contributions,
        expenses,
        status: pool.status.to_string(),
        denom: pool.denom,
        total_contributed: Uint128::from(total_contributed),
    })
}

fn query_member_balance(deps: Deps, pool_id: u64, member: &str) -> StdResult<MemberBalanceResponse> {
    let pool = POOLS.load(deps.storage, pool_id)?;
    let contributed = CONTRIBUTIONS
        .load(deps.storage, (pool_id, member))
        .unwrap_or(Uint128::zero());

    let expense_share_u128 = (1..=pool.expense_count)
        .filter_map(|eid| EXPENSES.may_load(deps.storage, (pool_id, eid)).ok().flatten())
        .filter(|e| e.split_between.iter().any(|m| m == member))
        .map(|e| e.amount.u128() / e.split_between.len() as u128)
        .sum::<u128>();

    let net = contributed.u128() as i128 - expense_share_u128 as i128;

    Ok(MemberBalanceResponse {
        member: member.to_string(),
        contributed,
        expense_share: Uint128::from(expense_share_u128),
        net_balance: net,
    })
}

fn query_pools_for_member(deps: Deps, member: &str) -> StdResult<PoolsForMemberResponse> {
    let pool_ids = MEMBER_POOLS.may_load(deps.storage, member)?.unwrap_or_default();
    Ok(PoolsForMemberResponse { pool_ids })
}

fn query_balance_board(deps: Deps, pool_id: u64) -> StdResult<BalanceBoardResponse> {
    let pool = POOLS.load(deps.storage, pool_id)?;
    let mut can_close = true;
    let mut balances = vec![];

    for member in &pool.members {
        let bal = query_member_balance(deps, pool_id, member)?;
        if bal.net_balance < 0 {
            can_close = false;
        }
        balances.push(bal);
    }

    Ok(BalanceBoardResponse { balances, can_close })
}
