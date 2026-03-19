import { IsInt, IsOptional, IsString, IsUrl, Matches, Min } from 'class-validator';

export class EnvironmentVariables {
  @IsOptional()
  @IsInt()
  @Min(1)
  PORT?: number;

  @IsString()
  DATABASE_URL!: string;

  @IsUrl({ require_tld: false, require_protocol: true })
  RPC_URL!: string;

  @Matches(/^0x[a-fA-F0-9]{40}$/)
  ESCROW_CONTRACT_ADDRESS!: string;

  @IsInt()
  @Min(0)
  BLOCKCHAIN_START_BLOCK!: number;

  @IsInt()
  @Min(0)
  BLOCKCHAIN_CONFIRMATIONS!: number;

  @IsInt()
  @Min(1)
  BLOCKCHAIN_SYNC_BATCH_SIZE!: number;

  @IsInt()
  @Min(100)
  BLOCKCHAIN_RETRY_DELAY_MS!: number;
}
