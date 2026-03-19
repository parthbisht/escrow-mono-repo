export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '3000', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    logLevel: (process.env.LOG_LEVEL ?? 'log,error,warn').split(',').map((level) => level.trim())
  },
  database: {
    url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/escrow?schema=public'
  },
  blockchain: {
    rpcUrl: process.env.RPC_URL ?? 'http://127.0.0.1:8545',
    escrowContractAddress: process.env.ESCROW_CONTRACT_ADDRESS ?? '',
    startBlock: parseInt(process.env.BLOCKCHAIN_START_BLOCK ?? '0', 10),
    confirmations: parseInt(process.env.BLOCKCHAIN_CONFIRMATIONS ?? '2', 10),
    syncBatchSize: parseInt(process.env.BLOCKCHAIN_SYNC_BATCH_SIZE ?? '1000', 10),
    retryDelayMs: parseInt(process.env.BLOCKCHAIN_RETRY_DELAY_MS ?? '5000', 10)
  }
});
