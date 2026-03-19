# Escrow Backend Service

Production-grade NestJS backend for the decentralized escrow system. The service persists on-chain escrow data into PostgreSQL via Prisma, exposes query APIs, broadcasts live updates over WebSockets, and supports manual blockchain backfills.

## Features

- NestJS modular architecture with `ConfigModule`, global validation, logging interceptor, and exception filter.
- Prisma + PostgreSQL persistence with idempotent event processing metadata.
- Ethers.js event listener for `EscrowCreated`, `Delivered`, `DisputeOpened`, `DisputeResolved`, and `FundsReleased`.
- REST API for escrow pagination, lookup by escrow ID, lookup by wallet, manual sync, and health checks.
- WebSocket namespace at `/escrows` for real-time escrow update notifications.
- Docker Compose setup for local PostgreSQL.

## Project Structure

```text
apps/backend
├── .env.example
├── docker-compose.yml
├── nest-cli.json
├── package.json
├── prisma
│   └── schema.prisma
├── src
│   ├── app.module.ts
│   ├── blockchain
│   │   ├── blockchain.module.ts
│   │   ├── blockchain.service.ts
│   │   └── event-listener.service.ts
│   ├── common
│   │   ├── enums
│   │   ├── filters
│   │   └── interceptors
│   ├── config
│   │   ├── abi.ts
│   │   ├── configuration.ts
│   │   ├── env.validation.ts
│   │   └── validate-env.ts
│   ├── health
│   │   ├── health.controller.ts
│   │   └── health.module.ts
│   ├── modules
│   │   └── escrow
│   │       ├── dto
│   │       ├── escrow.controller.ts
│   │       ├── escrow.gateway.ts
│   │       ├── escrow.module.ts
│   │       ├── escrow.service.ts
│   │       └── sync.controller.ts
│   └── prisma
│       ├── prisma.module.ts
│       └── prisma.service.ts
└── test
    └── jest-e2e.json
```

## Setup

1. Install dependencies from the monorepo root:
   ```bash
   npm install
   ```
2. Start PostgreSQL:
   ```bash
   docker compose -f apps/backend/docker-compose.yml up -d
   ```
3. Create your environment file:
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   ```
4. Generate Prisma client and run migrations:
   ```bash
   npm run prisma:generate --workspace escrow-backend
   npm run prisma:migrate --workspace escrow-backend
   ```
5. Start the service:
   ```bash
   npm run start:dev --workspace escrow-backend
   ```

## Event Listener Workflow

- On boot, the backend performs a historical sync from `BLOCKCHAIN_START_BLOCK` through the latest block minus `BLOCKCHAIN_CONFIRMATIONS`.
- Each event log is given an idempotency key of `<txHash>-<logIndex>` and stored in `ProcessedBlockchainEvent` so replays do not create duplicate state changes.
- Live events are ignored until they reach the configured confirmation threshold, which reduces basic blockchain reorg risk.
- Failed live event handling is retried after `BLOCKCHAIN_RETRY_DELAY_MS`.

## API

All endpoints are served under `/api`.

- `GET /api/escrows?page=1&limit=20` — paginated escrow listing.
- `GET /api/escrows/:id` — escrow lookup by on-chain `escrowId`.
- `GET /api/escrows/address/:wallet` — escrows where the wallet is buyer, seller, or arbitrator.
- `POST /api/sync` — manual historical sync with optional `{ "fromBlock": 0, "toBlock": 1000 }` body.
- `GET /api/health` — PostgreSQL health probe.
- `GET /api/docs` — Swagger documentation.

## WebSocket Events

Connect to namespace `/escrows` and listen for:

- `escrow.created`
- `escrow.delivered`
- `escrow.disputed`
- `escrow.resolved`
- `escrow.released`

## Environment Variables

See `.env.example` for defaults. The important variables are:

- `DATABASE_URL`
- `RPC_URL`
- `ESCROW_CONTRACT_ADDRESS`
- `BLOCKCHAIN_START_BLOCK`
- `BLOCKCHAIN_CONFIRMATIONS`
- `BLOCKCHAIN_SYNC_BATCH_SIZE`
- `BLOCKCHAIN_RETRY_DELAY_MS`
