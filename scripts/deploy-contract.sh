#!/bin/bash
# Deploy the Potluck pool contract to wasm-1 (WasmVM Minitia testnet)
#
# Prerequisites:
#   - minitiad binary installed: https://github.com/initia-labs/miniwasm/releases
#   - Funded wallet on wasm-1 (bridge funds from initiation-2 via Interwoven Bridge)
#   - Set DEPLOYER_KEY env var (key name in minitiad keyring)
#
# Usage:
#   DEPLOYER_KEY=mykey ./scripts/deploy-contract.sh

set -e

CHAIN_ID="wasm-1"
NODE="https://rpc-wasm-1.anvil.asia-southeast.initia.xyz"
FEE_DENOM="l2/8b3e1fc559b327a35335e3f26ff657eaee5ff8486ccd3c1bc59007a93cf23156"
WASM_FILE="./artifacts/potluck_pool.wasm"
KEY="${DEPLOYER_KEY:-mykey}"

echo "=== Building CosmWasm contract ==="
cd contracts/pool
cargo build --release --target wasm32-unknown-unknown
cp target/wasm32-unknown-unknown/release/potluck_pool.wasm ../../artifacts/potluck_pool.wasm
cd ../..

echo "=== Optimizing wasm binary ==="
# Requires wasm-opt: brew install binaryen
if command -v wasm-opt &> /dev/null; then
  wasm-opt -Os -o "$WASM_FILE" "$WASM_FILE"
  echo "Optimized wasm size: $(du -h $WASM_FILE | cut -f1)"
fi

echo "=== Storing contract on wasm-1 ==="
STORE_TX=$(minitiad tx wasm store "$WASM_FILE" \
  --from "$KEY" \
  --chain-id "$CHAIN_ID" \
  --node "$NODE" \
  --gas auto \
  --gas-adjustment 1.5 \
  --fees "200000${FEE_DENOM}" \
  --yes \
  --output json)

echo "Store tx: $STORE_TX"
CODE_ID=$(echo "$STORE_TX" | python3 -c "import json,sys; d=json.load(sys.stdin); print(next(x['value'] for x in d['logs'][0]['events'][0]['attributes'] if x['key']=='code_id'))")
echo "Code ID: $CODE_ID"

echo "=== Instantiating contract ==="
INIT_MSG='{"msg":{}}'
INSTANTIATE_TX=$(minitiad tx wasm instantiate "$CODE_ID" '{}' \
  --label "potluck-pool-factory" \
  --from "$KEY" \
  --chain-id "$CHAIN_ID" \
  --node "$NODE" \
  --gas auto \
  --gas-adjustment 1.5 \
  --fees "100000${FEE_DENOM}" \
  --yes \
  --output json)

CONTRACT_ADDRESS=$(echo "$INSTANTIATE_TX" | python3 -c "import json,sys; d=json.load(sys.stdin); print(next(x['value'] for x in d['logs'][0]['events'][1]['attributes'] if x['key']=='_contract_address'))")
echo ""
echo "=== Deployment complete! ==="
echo "Contract address: $CONTRACT_ADDRESS"
echo ""
echo "Add to .env:"
echo "NEXT_PUBLIC_POOL_CONTRACT_ADDRESS=$CONTRACT_ADDRESS"
