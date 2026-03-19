import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscrowEntity } from './escrow.entity';
import { EscrowsController } from './escrows.controller';
import { EscrowsService } from './escrows.service';

@Module({
  imports: [TypeOrmModule.forFeature([EscrowEntity])],
  controllers: [EscrowsController],
  providers: [EscrowsService],
  exports: [EscrowsService]
})
export class EscrowsModule {}
