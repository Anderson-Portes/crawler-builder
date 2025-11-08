import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Connection } from './entities/connection.entity';
import { Node } from '../nodes/entities/node.entity';
import { Workflow } from '../workflow/entities/workflow.entity';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { UpdateConnectionDto } from './dto/update-connection.dto';

@Injectable()
export class ConnectionService {
  constructor(
    @InjectRepository(Connection)
    private readonly connectionRepo: Repository<Connection>,
    @InjectRepository(Node)
    private readonly nodeRepo: Repository<Node>,
    @InjectRepository(Workflow)
    private readonly workflowRepo: Repository<Workflow>,
  ) {}

  async create(dto: CreateConnectionDto): Promise<Connection> {
    const sourceNode = await this.nodeRepo.findOneBy({ id: dto.sourceNodeId });
    const targetNode = await this.nodeRepo.findOneBy({ id: dto.targetNodeId });
    const workflow = await this.workflowRepo.findOneBy({ id: dto.workflowId });

    if (!sourceNode || !targetNode) throw new NotFoundException('Um dos nodes não foi encontrado');
    if (!workflow) throw new NotFoundException('Workflow não encontrado');

    const connection = this.connectionRepo.create({ sourceNode, targetNode, workflow });
    return this.connectionRepo.save(connection);
  }

  async findAll(): Promise<Connection[]> {
    return this.connectionRepo.find({ relations: ['sourceNode', 'targetNode', 'workflow'] });
  }

  async findOne(id: number): Promise<Connection> {
    const conn = await this.connectionRepo.findOne({ where: { id }, relations: ['sourceNode', 'targetNode', 'workflow'] });
    if (!conn) throw new NotFoundException(`Connection ${id} não encontrada`);
    return conn;
  }

  async update(id: number, dto: UpdateConnectionDto): Promise<Connection> {
  const conn = await this.findOne(id);

  if (dto.sourceNodeId) {
    const sourceNode = await this.nodeRepo.findOneBy({ id: dto.sourceNodeId });
    if (!sourceNode) throw new Error('Source node not found');
    conn.sourceNode = sourceNode;
  }

  if (dto.targetNodeId) {
    const targetNode = await this.nodeRepo.findOneBy({ id: dto.targetNodeId });
    if (!targetNode) throw new Error('Target node not found');
    conn.targetNode = targetNode;
  }

  if (dto.workflowId) {
    const workflow = await this.workflowRepo.findOneBy({ id: dto.workflowId });
    if (!workflow) throw new Error('Workflow not found');
    conn.workflow = workflow;
  }

  return this.connectionRepo.save(conn);
}


  async remove(id: number): Promise<void> {
    await this.connectionRepo.delete(id);
  }
}
