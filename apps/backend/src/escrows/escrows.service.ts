import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { EscrowEntity } from './escrow.entity';

@Injectable()
export class EscrowsService {
  constructor(
    @InjectRepository(EscrowEntity)
    private readonly escrowsRepository: Repository<EscrowEntity>
  ) {}

  async create(createEscrowDto: CreateEscrowDto): Promise<EscrowEntity> {
    const escrow = this.escrowsRepository.create({
      ...createEscrowDto,
      deliveryDeadline: new Date(createEscrowDto.deliveryDeadline)
    });

    return this.escrowsRepository.save(escrow);
  }

  async findAll(): Promise<EscrowEntity[]> {
    return this.escrowsRepository.find({ order: { createdAt: 'DESC' } });
  }
}
