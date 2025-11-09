import { Processor, WorkerHost } from '@nestjs/bullmq';
import { WorkflowExecutorService } from './workflow-executor.service';
import { WORKFLOW_EXECUTOR_QUEUE } from './workflow-executor.constants';

@Processor(WORKFLOW_EXECUTOR_QUEUE)
export class WorkflowExecutorProcessor extends WorkerHost {
  constructor(
    private readonly workflowExecutorService: WorkflowExecutorService,
  ) {
    super();
  }

  async process(job) {
    const { workflowId } = job.data;
    console.log(`🔄 Executando workflow ${workflowId} (job ${job.id})`);
    await this.workflowExecutorService.execute(workflowId);
    console.log(`✅ Workflow ${workflowId} finalizado`);
  }
}
