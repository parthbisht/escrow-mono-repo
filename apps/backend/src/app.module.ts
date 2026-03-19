import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validateEnv } from './config/validate-env';
import { PrismaModule } from './prisma/prisma.module';
import { EscrowModule } from './modules/escrow/escrow.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validate: validateEnv,
      envFilePath: ['apps/backend/.env', '.env']
    }),
    CacheModule.register({ isGlobal: true, ttl: 5_000 }),
    PrismaModule,
    EscrowModule,
    HealthModule
  ]
})
export class AppModule {}
