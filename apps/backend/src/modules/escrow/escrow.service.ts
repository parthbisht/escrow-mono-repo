import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EscrowState } from '../../common/enums/escrow-state.enum';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Injectable()
export class EscrowService {
  private readonly logger = new Logger(EscrowService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listEscrows(query: PaginationQueryDto) {
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.escrow.findMany({
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.escrow.count()
    ]);

    return {
      data: items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1
      }
    };
  }

  async getEscrowByEscrowId(escrowId: string) {
    const escrow = await this.prisma.escrow.findUnique({ where: { escrowId } });
    if (!escrow) {
      throw new NotFoundException(`Escrow ${escrowId} not found`);
    }
    return escrow;
  }

  async getEscrowsByWallet(wallet: string) {
    return this.prisma.escrow.findMany({
      where: {
        OR: [{ buyer: wallet }, { seller: wallet }, { arbitrator: wallet }]
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async upsertEscrowFromEvent(payload: {
    escrowId: string;
    buyer: string;
    seller: string;
    arbitrator: string;
    amount: bigint;
    metadata: string;
    state?: EscrowState;
  }) {
    this.logger.debug(`Upserting escrow ${payload.escrowId} from chain event`);

    return this.prisma.escrow.upsert({
      where: { escrowId: payload.escrowId },
      create: {
        escrowId: payload.escrowId,
        buyer: payload.buyer,
        seller: payload.seller,
        arbitrator: payload.arbitrator,
        amount: payload.amount.toString(),
        metadata: payload.metadata,
        state: payload.state ?? EscrowState.Pending
      },
      update: {
        buyer: payload.buyer,
        seller: payload.seller,
        arbitrator: payload.arbitrator,
        amount: payload.amount.toString(),
        metadata: payload.metadata,
        state: payload.state ?? EscrowState.Pending
      }
    });
  }

  async updateEscrowState(
    escrowId: string,
    state: EscrowState,
    splitAmounts?: { buyerAmount?: bigint; sellerAmount?: bigint }
  ) {
    return this.prisma.escrow.update({
      where: { escrowId },
      data: {
        state,
        buyerAmount: splitAmounts?.buyerAmount?.toString(),
        sellerAmount: splitAmounts?.sellerAmount?.toString()
      }
    });
  }
}
