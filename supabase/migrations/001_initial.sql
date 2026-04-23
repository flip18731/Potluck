-- Potluck schema
-- Amounts are stored as text (uinit micro-units) to avoid JS BigInt ↔ JSON loss

create extension if not exists "uuid-ossp";

create table pools (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  creator_address text not null,
  creator_username text,
  members jsonb not null default '[]',
  status text not null default 'open' check (status in ('open', 'closed')),
  denom text not null default 'uinit',
  end_date timestamptz,
  created_at timestamptz not null default now(),
  contract_address text,
  treasury_address text,
  tx_hash text
);

create table contributions (
  id uuid primary key default uuid_generate_v4(),
  pool_id uuid not null references pools(id) on delete cascade,
  member_address text not null,
  member_username text,
  amount text not null,       -- uinit as string
  tx_hash text not null,
  created_at timestamptz not null default now()
);

create table expenses (
  id uuid primary key default uuid_generate_v4(),
  pool_id uuid not null references pools(id) on delete cascade,
  description text not null,
  amount text not null,       -- uinit as string
  paid_by_address text not null,
  paid_by_username text,
  split_between text[] not null,
  reimbursed boolean not null default false,
  reimburse_tx_hash text,
  receipt_url text,
  created_at timestamptz not null default now()
);

-- Indexes for common queries
create index contributions_pool_id_idx on contributions(pool_id);
create index contributions_member_idx on contributions(member_address);
create index expenses_pool_id_idx on expenses(pool_id);

-- RLS: public read, authenticated write
alter table pools enable row level security;
alter table contributions enable row level security;
alter table expenses enable row level security;

create policy "Anyone can read pools" on pools for select using (true);
create policy "Anyone can read contributions" on contributions for select using (true);
create policy "Anyone can read expenses" on expenses for select using (true);

-- Service role bypasses RLS for writes
