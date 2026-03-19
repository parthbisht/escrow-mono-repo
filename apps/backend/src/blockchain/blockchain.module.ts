import { Module, forwardRef } from '@nestjs/common';
import { EscrowModule } from '../modules/escrow/escrow.module';
import { BlockchainService } from './blockchain.service';
import { EventListenerService } from './event-listener.service';

@Module({
  imports: [forwardRef(() => EscrowModule)],
  providers: [BlockchainService, EventListenerService],
  exports: [BlockchainService]
})
export class BlockchainModule {}
