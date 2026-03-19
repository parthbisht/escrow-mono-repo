import { IsEthereumAddress } from 'class-validator';

export class AddressParamDto {
  @IsEthereumAddress()
  wallet!: string;
}
