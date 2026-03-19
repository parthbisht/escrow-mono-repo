import { CacheModule } from '@nestjs/cache-manager';
import { Module, forwardRef } from '@nestjs/common';
import { BlockchainModule } from '../../blockchain/blockchain.module';
import { EscrowController } from './escrow.controller';
import { EscrowGateway } from './escrow.gateway';
import { EscrowService } from './escrow.service';
import { SyncController } from './sync.controller';

@Module({
  imports: [CacheModule.register({ ttl: 10_000, max: 100 }), forwardRef(() => BlockchainModule)],
  controllers: [EscrowController, SyncController],
  providers: [EscrowService, EscrowGateway],
  exports: [EscrowService, EscrowGateway]
})
export class EscrowModule {}
