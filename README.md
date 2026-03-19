# Escrow Platform Monorepo

Production-oriented monorepo containing the decentralized escrow smart contracts, a React frontend, and a NestJS + PostgreSQL backend.

## Folder Structure

```text
.
├── .gitignore
├── README.md
├── package.json
└── apps
    ├── backend
    │   ├── .env.example
    │   ├── nest-cli.json
    │   ├── package.json
    │   ├── src
    │   │   ├── app.module.ts
    │   │   ├── escrows
    │   │   │   ├── dto
    │   │   │   │   └── create-escrow.dto.ts
    │   │   │   ├── escrow.entity.ts
    │   │   │   ├── escrows.controller.ts
    │   │   │   ├── escrows.module.ts
    │   │   │   └── escrows.service.ts
    │   │   └── main.ts
    │   ├── test
    │   │   └── app.e2e-spec.ts
    │   └── tsconfig.json
    ├── frontend
    │   ├── index.html
    │   ├── package.json
    │   ├── src
    │   │   ├── App.jsx
    │   │   ├── components
    │   │   │   └── EscrowCard.jsx
    │   │   ├── main.jsx
    │   │   └── styles.css
    │   └── vite.config.js
    └── smart-contract
        ├── .env.example
        ├── contracts
        │   ├── Escrow.sol
        │   └── mocks
        │       └── ReentrantSeller.sol
        ├── hardhat.config.js
        ├── package.json
        ├── scripts
        │   └── deploy.js
        └── test
            └── Escrow.test.js
```

## Workspaces

- `apps/smart-contract`: Hardhat workspace for the Solidity escrow contract.
- `apps/frontend`: React + Vite frontend scaffold for the DApp experience.
- `apps/backend`: NestJS REST API scaffold configured for PostgreSQL persistence.

## Smart Contract Workspace

The contract workspace keeps the previously requested escrow functionality:

- Solidity `^0.8.20`
- OpenZeppelin `ReentrancyGuard`
- Packed escrow storage (`uint96`, `uint64`)
- IPFS metadata support
- Delivery, dispute, cancellation, and withdrawal flows
- Hardhat + Chai tests and deployment script

Run from the repo root after installing dependencies:

```bash
npm install
npm run compile --workspace escrow-contracts
npm run test --workspace escrow-contracts
```

## Frontend Workspace

The frontend is a React + Vite starter for the escrow DApp UI. It includes:

- A landing page for escrow creation, delivery management, and dispute resolution
- Reusable card components
- Styling for a production-style dashboard shell
- `ethers` dependency for wallet and contract integrations

Run locally:

```bash
npm run dev --workspace frontend-dapp
```

## Backend Workspace

The backend is a NestJS starter configured for PostgreSQL with TypeORM:

- Global configuration and validation
- `EscrowEntity` persistence model
- `POST /api/escrows` and `GET /api/escrows` endpoints
- Environment-driven Postgres connection settings

Run locally:

```bash
cp apps/backend/.env.example apps/backend/.env
npm run start:dev --workspace escrow-backend
```

## Suggested Next Steps

1. Install workspace dependencies with `npm install`.
2. Add database migrations for the backend.
3. Connect the React app to wallet providers and backend APIs.
4. Export the smart contract ABI into the frontend/backend workspaces.
5. Add CI to run Hardhat, frontend, and backend test suites.
