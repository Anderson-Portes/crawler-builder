import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CrawlerService {
  constructor(@InjectQueue('crawler') private readonly crawlerQueue: Queue) {}

  async addJob(data: any) {
    return this.crawlerQueue.add('crawler-task', data);
  }
}
