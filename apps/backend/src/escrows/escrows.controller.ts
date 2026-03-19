import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { EscrowsService } from './escrows.service';

@Controller('escrows')
export class EscrowsController {
  constructor(private readonly escrowsService: EscrowsService) {}

  @Post()
  create(@Body() createEscrowDto: CreateEscrowDto) {
    return this.escrowsService.create(createEscrowDto);
  }

  @Get()
  findAll() {
    return this.escrowsService.findAll();
  }
}
