import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CrawlerProcessor } from './crawler.processor';
import { CrawlerService } from './crawler.service';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      },
    }),
    BullModule.registerQueue({
      name: 'crawler',
    }),
  ],
  providers: [CrawlerProcessor, CrawlerService],
  exports: [CrawlerService],
})
export class QueueModule {}
