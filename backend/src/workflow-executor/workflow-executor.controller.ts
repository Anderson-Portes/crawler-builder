import { Controller, Post, Param } from '@nestjs/common';
import { WorkflowExecutorService } from './workflow-executor.service';

@Controller('workflow-executor')
export class WorkflowExecutorController {
  constructor(
    private readonly workflowExecutorService: WorkflowExecutorService,
  ) {}

  @Post('/:id/run')
  create(@Param('id') id: string) {
    return this.workflowExecutorService.enqueue(+id);
  }
}
