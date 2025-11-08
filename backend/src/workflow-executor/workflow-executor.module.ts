import { Module } from '@nestjs/common';
import { WorkflowExecutorService } from './workflow-executor.service';
import { BullModule } from '@nestjs/bullmq';

export const WORKFLOW_EXECUTOR_QUEUE = 'WORKFLOW_PROCESSING_QUEUE';
@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue({
      name: WORKFLOW_EXECUTOR_QUEUE,
    }),
  ],
  providers: [WorkflowExecutorService],
})
export class WorkflowExecutorModule {}
