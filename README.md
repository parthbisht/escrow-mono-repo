# Decentralized Escrow Hardhat Project

Production-oriented Hardhat project for a decentralized ETH escrow system with dispute resolution, inactivity timeouts, and a reentrancy attack simulation.

## Folder Structure

```text
.
├── .env.example
├── contracts
│   ├── Escrow.sol
│   └── mocks
│       └── ReentrantSeller.sol
├── hardhat.config.js
├── package.json
├── README.md
├── scripts
│   └── deploy.js
└── test
    └── Escrow.test.js
```

## Features

- Buyer-funded escrow creation with seller and arbitrator roles.
- Lifecycle states: `Pending`, `Delivered`, `Disputed`, `Resolved`, `Cancelled`.
- IPFS metadata support for order details.
- Buyer-controlled release, dispute opening, and seller inactivity cancellation.
- Arbitrator dispute splitting.
- Seller withdrawal after the post-delivery buyer review window expires.
- `ReentrancyGuard`, CEI ordering, and low-level `call` ETH transfers.
- Storage packing via `uint96` and `uint64` fields.

## Contract Overview

### Main entrypoints

- `createEscrow(seller, arbitrator, deliveryTime, metadata)` payable
- `markDelivered(escrowId)`
- `releaseFunds(escrowId)`
- `openDispute(escrowId)`
- `resolveDispute(escrowId, buyerAmount, sellerAmount)`
- `cancelEscrow(escrowId)`
- `sellerWithdraw(escrowId)`

### Timeout model

- `deliveryTime` is an absolute Unix timestamp deadline set at escrow creation.
- If the seller never marks delivery and the deadline passes, the buyer can call `cancelEscrow`.
- After delivery is marked, the buyer has a fixed `REVIEW_PERIOD` of 3 days before the seller can call `sellerWithdraw`.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. Compile contracts:

   ```bash
   npm run compile
   ```

4. Run tests:

   ```bash
   npm test
   ```

## Deployment

Deploy locally:

```bash
npx hardhat run scripts/deploy.js --network hardhat
```

Deploy to Sepolia:

```bash
npm run deploy:sepolia
```

## Security Notes

- Reentrancy is prevented by `ReentrancyGuard` on all fund-moving functions.
- State updates happen before external calls.
- Role-restricted functions gate callers with explicit checks.
- ETH transfers use `call` and revert on failure.

## Testing Coverage

The test suite covers:

- Escrow creation.
- Normal seller delivery and buyer release flow.
- Dispute initiation and arbitrator resolution.
- Seller-missed-delivery cancellation timeout.
- Buyer inactivity seller-withdraw timeout.
- Reentrancy attack simulation against withdrawal.
