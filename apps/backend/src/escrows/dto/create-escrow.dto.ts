import { IsEthereumAddress, IsISO8601, IsNotEmpty, IsString } from 'class-validator';

export class CreateEscrowDto {
  @IsString()
  @IsNotEmpty()
  escrowId!: string;

  @IsEthereumAddress()
  buyer!: string;

  @IsEthereumAddress()
  seller!: string;

  @IsEthereumAddress()
  arbitrator!: string;

  @IsString()
  @IsNotEmpty()
  amount!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;

  @IsString()
  @IsNotEmpty()
  metadata!: string;

  @IsISO8601()
  deliveryDeadline!: string;
}
