import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';

@Injectable()
export class EventListenerService implements OnApplicationShutdown {
  private readonly logger = new Logger(EventListenerService.name);

  constructor(private readonly blockchainService: BlockchainService) {
    this.logger.log('Event listener service initialized');
  }

  onApplicationShutdown(signal?: string): void {
    this.logger.log(`Application shutting down${signal ? ` due to ${signal}` : ''}; blockchain listeners will be torn down with process exit`);
  }
}
