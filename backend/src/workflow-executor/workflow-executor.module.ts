import { Module } from '@nestjs/common';
import { WorkflowExecutorService } from './workflow-executor.service';
import { BullModule } from '@nestjs/bullmq';
import { WorkflowExecutorProcessor } from './workflow-executor.processor';
import { WORKFLOW_EXECUTOR_QUEUE } from './workflow-executor.constants';
import { WorkflowExecutorController } from './workflow-executor.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: WORKFLOW_EXECUTOR_QUEUE,
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
  ],
  providers: [WorkflowExecutorService, WorkflowExecutorProcessor],
  exports: [WorkflowExecutorService],
  controllers: [WorkflowExecutorController],
})
export class WorkflowExecutorModule {}
