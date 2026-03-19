import { IsNotEmpty, IsString } from 'class-validator';

export class EscrowParamDto {
  @IsString()
  @IsNotEmpty()
  id!: string;
}
