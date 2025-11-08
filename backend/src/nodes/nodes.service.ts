import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Node } from './entities/node.entity';
import { Workflow } from '../workflow/entities/workflow.entity';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';

@Injectable()
export class NodeService {
  constructor(
    @InjectRepository(Node)
    private readonly nodeRepo: Repository<Node>,
    @InjectRepository(Workflow)
    private readonly workflowRepo: Repository<Workflow>,
  ) {}

  async create(dto: CreateNodeDto): Promise<Node> {
    const workflow = await this.workflowRepo.findOneBy({ id: dto.workflowId });
    if (!workflow) throw new NotFoundException('Workflow não encontrado');
    const node = this.nodeRepo.create({ ...dto, workflow });
    return this.nodeRepo.save(node);
  }

  async findAll(): Promise<Node[]> {
    return this.nodeRepo.find({ relations: ['workflow'] });
  }

  async findOne(id: number): Promise<Node> {
    const node = await this.nodeRepo.findOne({ where: { id }, relations: ['workflow'] });
    if (!node) throw new NotFoundException(`Node ${id} não encontrado`);
    return node;
  }

  async update(id: number, dto: UpdateNodeDto): Promise<Node> {
    const node = await this.findOne(id);
    Object.assign(node, dto);
    return this.nodeRepo.save(node);
  }

  async remove(id: number): Promise<void> {
    await this.nodeRepo.delete(id);
  }
}
