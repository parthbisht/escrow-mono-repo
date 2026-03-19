import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Contract, Interface, JsonRpcProvider, Log } from 'ethers';
import { PrismaService } from '../prisma/prisma.service';
import { ESCROW_CONTRACT_ABI } from '../config/abi';
import { EscrowService } from '../modules/escrow/escrow.service';
import { EscrowGateway } from '../modules/escrow/escrow.gateway';
import { EscrowState } from '@prisma/client';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
  private readonly provider: JsonRpcProvider;
  private readonly contract: Contract;
  private readonly iface = new Interface(ESCROW_CONTRACT_ABI);
  private readonly startBlock: number;
  private readonly confirmations: number;
  private readonly syncBatchSize: number;
  private readonly retryDelayMs: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly escrowService: EscrowService,
    private readonly escrowGateway: EscrowGateway
  ) {
    const rpcUrl = this.configService.getOrThrow<string>('blockchain.rpcUrl');
    const contractAddress = this.configService.getOrThrow<string>('blockchain.escrowContractAddress');
    this.startBlock = this.configService.getOrThrow<number>('blockchain.startBlock');
    this.confirmations = this.configService.getOrThrow<number>('blockchain.confirmations');
    this.syncBatchSize = this.configService.getOrThrow<number>('blockchain.syncBatchSize');
    this.retryDelayMs = this.configService.getOrThrow<number>('blockchain.retryDelayMs');
    this.provider = new JsonRpcProvider(rpcUrl);
    this.contract = new Contract(contractAddress, ESCROW_CONTRACT_ABI, this.provider);
  }

  async onModuleInit(): Promise<void> {
    await this.syncPastEvents();
    this.subscribeToEvents();
  }

  async syncPastEvents(fromBlock?: number, toBlock?: number) {
    const currentBlock = await this.provider.getBlockNumber();
    const safeToBlock = Math.max((toBlock ?? currentBlock) - this.confirmations, 0);
    let cursor = fromBlock ?? this.startBlock;
    let processed = 0;

    while (cursor <= safeToBlock) {
      const batchEnd = Math.min(cursor + this.syncBatchSize - 1, safeToBlock);
      this.logger.log(`Syncing escrow events from block ${cursor} to ${batchEnd}`);
      const logs = await this.provider.getLogs({
        address: await this.contract.getAddress(),
        fromBlock: cursor,
        toBlock: batchEnd
      });

      for (const log of logs) {
        await this.processLog(log, true);
        processed += 1;
      }

      cursor = batchEnd + 1;
    }

    return { fromBlock: fromBlock ?? this.startBlock, toBlock: safeToBlock, processed };
  }

  private subscribeToEvents(): void {
    this.provider.on({ address: this.contract.target as string }, async (log: Log) => {
      try {
        await this.processLog(log, false);
      } catch (error) {
        this.logger.error('Live event processing failed, scheduling retry', error instanceof Error ? error.stack : undefined);
        setTimeout(() => {
          void this.processLog(log, false).catch((retryError) => {
            this.logger.error('Live event retry failed', retryError instanceof Error ? retryError.stack : undefined);
          });
        }, this.retryDelayMs);
      }
    });
  }

  private async processLog(log: Log, allowPendingConfirmations: boolean): Promise<void> {
    const parsed = this.iface.parseLog(log);
    if (!parsed) {
      return;
    }

    const blockNumber = Number(log.blockNumber ?? 0);
    const latestBlock = await this.provider.getBlockNumber();
    const confirmations = latestBlock - blockNumber;
    if (!allowPendingConfirmations && confirmations < this.confirmations) {
      this.logger.warn(`Skipping unconfirmed event ${parsed.name} at block ${blockNumber}`);
      return;
    }

    const eventKey = `${log.transactionHash}-${log.index}`;
    const alreadyProcessed = await this.prisma.processedBlockchainEvent.findUnique({ where: { eventKey } });
    if (alreadyProcessed) {
      return;
    }

    switch (parsed.name) {
        case 'EscrowCreated': {
          const [escrowId, buyer, seller, arbitrator, amount, , metadata] = parsed.args;
          const escrow = await this.escrowService.upsertEscrowFromEvent({
            escrowId: escrowId.toString(),
            buyer,
            seller,
            arbitrator,
            amount,
            metadata,
            state: EscrowState.Pending
          });
          this.escrowGateway.broadcastUpdate('escrow.created', escrow);
          break;
        }
        case 'Delivered': {
          const [escrowId] = parsed.args;
          const escrow = await this.escrowService.updateEscrowState(escrowId.toString(), EscrowState.Delivered);
          this.escrowGateway.broadcastUpdate('escrow.delivered', escrow);
          break;
        }
        case 'DisputeOpened': {
          const [escrowId] = parsed.args;
          const escrow = await this.escrowService.updateEscrowState(escrowId.toString(), EscrowState.Disputed);
          this.escrowGateway.broadcastUpdate('escrow.disputed', escrow);
          break;
        }
        case 'DisputeResolved': {
          const [escrowId, , buyerAmount, sellerAmount] = parsed.args;
          const escrow = await this.escrowService.updateEscrowState(escrowId.toString(), EscrowState.Resolved, {
            buyerAmount,
            sellerAmount
          });
          this.escrowGateway.broadcastUpdate('escrow.resolved', escrow);
          break;
        }
        case 'FundsReleased': {
          const [escrowId, , , amount] = parsed.args;
          const escrow = await this.escrowService.updateEscrowState(escrowId.toString(), EscrowState.Resolved, {
            sellerAmount: amount
          });
          this.escrowGateway.broadcastUpdate('escrow.released', escrow);
          break;
        }
        default:
          return;
      }

    await this.prisma.processedBlockchainEvent.create({
      data: {
        eventKey,
        escrowId: parsed.args[0]?.toString(),
        eventName: parsed.name,
        blockNumber: BigInt(blockNumber),
        txHash: log.transactionHash,
        logIndex: log.index
      }
    });
  }
}
