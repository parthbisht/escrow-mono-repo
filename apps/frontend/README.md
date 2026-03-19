# Escrow Frontend

Production-style React + Vite dashboard for the decentralized escrow platform.

## Stack

- React + Vite
- Tailwind CSS
- Wagmi + Viem for contract interactions
- RainbowKit for wallet connection
- React Query for backend/API state
- React Hot Toast for user feedback

## Features

- Connect MetaMask or compatible wallets with RainbowKit.
- Display the connected address and role-aware escrow actions.
- Create escrows by calling the smart contract directly.
- Fetch escrow data from the backend API and display buyer/seller/arbitrator metadata.
- Trigger `markDelivered`, `releaseFunds`, `openDispute`, and `resolveDispute` flows.
- Sync backend data on demand.
- Optional IPFS uploads through Pinata.
- Local transaction history panel for recent submitted transactions.

## Folder Structure

```text
apps/frontend
├── .env.example
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── src
│   ├── components
│   ├── config
│   ├── hooks
│   ├── pages
│   ├── services
│   ├── utils
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
└── vite.config.js
```

## Setup

1. Install dependencies from the monorepo root:
   ```bash
   npm install
   ```
2. Copy the environment template:
   ```bash
   cp apps/frontend/.env.example apps/frontend/.env
   ```
3. Update the backend API URL, escrow contract address, and WalletConnect project ID.
4. Start the frontend:
   ```bash
   npm run dev --workspace frontend-dapp
   ```

## Environment Variables

- `VITE_BACKEND_API_URL` — NestJS backend base URL.
- `VITE_ESCROW_CONTRACT_ADDRESS` — deployed escrow contract address.
- `VITE_WALLETCONNECT_PROJECT_ID` — RainbowKit / WalletConnect project ID.
- `VITE_PINATA_JWT` — optional Pinata JWT for IPFS uploads.
- `VITE_PINATA_GATEWAY` — optional IPFS gateway.

## Contract Integration Notes

Smart contract writes are centralized in `src/hooks/useEscrowActions.js`. Update `src/services/contract.js` if the deployed contract ABI changes.
