# NEAR Smart Contract - Loan Trading Platform

## Overview

This smart contract manages the on-chain ownership and lifecycle of loan tokens on the NEAR blockchain. It provides immutable audit trails for all ownership transfers and lifecycle events.

## Core Functionality

### 1. Loan Token Registration
- Only authorized originators can register loan tokens
- Each token represents off-chain loan ownership
- 100% initial ownership assigned to originator

### 2. Fractional Ownership Transfer
- Transfer partial ownership (in basis points)
- Automatic consolidation of ownership records
- Immutable transfer history

### 3. Lifecycle Management
- Track loan status (Active, Settled, Defaulted, Restructured)
- Only originator can update lifecycle status
- Event logging for all state changes

### 4. Query Functions
- Get token details and ownership breakdown
- View transfer history
- Query tokens by owner

## Building

```bash
cargo build --target wasm32-unknown-unknown --release
```

## Testing

```bash
cargo test
```

## Deployment

### Testnet
```bash
near deploy --wasmFile target/wasm32-unknown-unknown/release/loan_trading_contract.wasm --accountId YOUR_ACCOUNT.testnet
```

### Initialize
```bash
near call YOUR_ACCOUNT.testnet new '{"admin": "ADMIN_ACCOUNT.testnet"}' --accountId YOUR_ACCOUNT.testnet
```

## Usage Examples

### Authorize Originator
```bash
near call CONTRACT.testnet authorize_originator '{"originator": "originator.testnet"}' --accountId ADMIN.testnet
```

### Register Loan Token
```bash
near call CONTRACT.testnet register_loan_token '{
  "token_id": "LOAN-001",
  "off_chain_loan_id": "OFF-CHAIN-001",
  "total_value": "1000000000000000000000000"
}' --accountId originator.testnet --deposit 0.1
```

### Transfer Ownership
```bash
near call CONTRACT.testnet transfer_fractional_ownership '{
  "token_id": "LOAN-001",
  "to": "investor.testnet",
  "fraction": 2500,
  "price": "250000000000000000000000"
}' --accountId originator.testnet --deposit 0.1
```

### Query Token
```bash
near view CONTRACT.testnet get_loan_token '{"token_id": "LOAN-001"}'
```

## Event Logging

All critical operations emit structured logs:
- `LOAN_TOKEN_REGISTERED`
- `OWNERSHIP_TRANSFERRED`
- `LIFECYCLE_UPDATED`
- `ORIGINATOR_AUTHORIZED`
- `ORIGINATOR_REVOKED`

These logs are queryable via NEAR blockchain explorers and can be indexed for analytics.

## Security Considerations

1. **Authorization**: Only authorized originators can register loans
2. **Validation**: All inputs are validated before processing
3. **Ownership Verification**: Transfers require sufficient ownership fraction
4. **Immutability**: Transfer history cannot be modified
5. **Access Control**: Lifecycle updates restricted to originators

## Gas Optimization

- Efficient storage using NEAR collections
- Minimal computational complexity
- Optimized release profile for small WASM size
