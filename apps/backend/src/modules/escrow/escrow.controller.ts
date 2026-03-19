import { CacheInterceptor } from '@nestjs/cache-manager';
import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EscrowService } from './escrow.service';
import { AddressParamDto } from './dto/address-param.dto';
import { EscrowParamDto } from './dto/escrow-param.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@ApiTags('escrows')
@Controller('escrows')
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'List escrows with pagination' })
  @ApiOkResponse({ description: 'Paginated escrow list' })
  listEscrows(@Query() query: PaginationQueryDto) {
    return this.escrowService.listEscrows(query);
  }

  @Get('address/:wallet')
  @ApiOperation({ summary: 'Get escrows by wallet address' })
  getEscrowsByWallet(@Param() params: AddressParamDto) {
    return this.escrowService.getEscrowsByWallet(params.wallet);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get escrow by on-chain escrowId' })
  getEscrow(@Param() params: EscrowParamDto) {
    return this.escrowService.getEscrowByEscrowId(params.id);
  }
}

