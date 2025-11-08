import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from './entities/workflow.entity';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(Workflow)
    private readonly workflowRepo: Repository<Workflow>,
  ) {}

  async create(dto: CreateWorkflowDto): Promise<Workflow> {
    const workflow = this.workflowRepo.create(dto);
    return await this.workflowRepo.save(workflow);
  }

  async findAll(): Promise<Workflow[]> {
    return this.workflowRepo.find();
  }

  async findOne(id: number): Promise<Workflow> {
    const workflow = await this.workflowRepo.findOneBy({ id });
    if (!workflow) throw new NotFoundException(`Workflow ${id} não encontrado`);
    return workflow;
  }

  async findOneDetailed(id: number) {
    return this.workflowRepo.findOne({
      where: { id },
      relations: ['nodes', 'connections', 'connections.sourceNode', 'connections.targetNode'],
    });
  }

  async update(id: number, dto: UpdateWorkflowDto): Promise<Workflow> {
    const workflow = await this.findOne(id);
    Object.assign(workflow, dto);
    return await this.workflowRepo.save(workflow);
  }

  async remove(id: number): Promise<void> {
    await this.workflowRepo.delete(id);
  }
}
