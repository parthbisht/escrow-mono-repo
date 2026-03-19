# Escrow Platform Monorepo

Production-oriented monorepo for a decentralized escrow platform with three applications:

- `apps/smart-contract` — Hardhat workspace containing the escrow Solidity contracts and tests.
- `apps/frontend` — React + Vite frontend workspace for the user-facing DApp.
- `apps/backend` — NestJS + Prisma + PostgreSQL backend for blockchain event syncing, querying, and real-time updates.

## Monorepo Layout

```text
.
├── README.md
├── package.json
└── apps
    ├── backend
    │   ├── README.md
    │   ├── docker-compose.yml
    │   ├── prisma
    │   └── src
    ├── frontend
    │   ├── package.json
    │   └── src
    └── smart-contract
        ├── contracts
        ├── scripts
        └── test
```

## Workspace Commands

Install dependencies from the repository root:

```bash
npm install
```

### Smart Contract

```bash
npm run test --workspace escrow-contracts
```

### Frontend

```bash
npm run dev --workspace frontend-dapp
```

### Backend

```bash
cp apps/backend/.env.example apps/backend/.env
docker compose -f apps/backend/docker-compose.yml up -d
npm run prisma:generate --workspace escrow-backend
npm run prisma:migrate --workspace escrow-backend
npm run start:dev --workspace escrow-backend
```

See `apps/backend/README.md` for backend architecture, API details, and blockchain sync behavior, and `apps/frontend/README.md` for the wallet/UI integration setup.
