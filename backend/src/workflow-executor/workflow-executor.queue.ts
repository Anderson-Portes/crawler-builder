import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { WORKFLOW_EXECUTOR_QUEUE } from './workflow-executor.module';

@Injectable()
export class WorkflowExecutorQueue {
  constructor(@InjectQueue(WORKFLOW_EXECUTOR_QUEUE) private queue: Queue) {}

  async enqueue(workflowId: number) {
    const job = await this.queue.add('run-workflow', { workflowId });
    return job.id;
  }
}
