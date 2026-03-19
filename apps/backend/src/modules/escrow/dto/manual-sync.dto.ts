import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class ManualSyncDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  fromBlock?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  toBlock?: number;
}
