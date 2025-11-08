import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('crawler')
export class CrawlerProcessor extends WorkerHost {
  async process(job: Job<any>): Promise<any> {
    console.log('Executando job de crawler:', job.data);
    // Aqui entra a lógica real de web scraping
    await new Promise((r) => setTimeout(r, 2000)); // simulação
    return { status: 'done', data: { ...job.data } };
  }
}
