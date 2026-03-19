import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { ManualSyncDto } from './dto/manual-sync.dto';

@ApiTags('sync')
@Controller('sync')
export class SyncController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Post()
  @ApiOperation({ summary: 'Manually sync escrow events from the blockchain' })
  async sync(@Body() dto: ManualSyncDto) {
    return this.blockchainService.syncPastEvents(dto.fromBlock, dto.toBlock);
  }
}
