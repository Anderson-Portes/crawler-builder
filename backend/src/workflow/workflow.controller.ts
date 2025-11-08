import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { WorkflowExecutorQueue } from 'src/workflow-executor/workflow-executor.queue';

@Controller('workflows')
export class WorkflowController {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly workflowExecutorQueue: WorkflowExecutorQueue,
  ) {}

  @Post()
  create(@Body() dto: CreateWorkflowDto) {
    return this.workflowService.create(dto);
  }

  @Get()
  findAll() {
    return this.workflowService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.workflowService.findOneDetailed(+id);
  }

  @Post(':id/run')
  async run(@Param('id') id: number) {
    const jobId = await this.workflowExecutorQueue.enqueue(+id);
    return { jobId };
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateWorkflowDto) {
    return this.workflowService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.workflowService.remove(id);
  }
}
