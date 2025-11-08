import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Node } from '../../nodes/entities/node.entity';
import { Workflow } from '../../workflow/entities/workflow.entity';

@Entity('connections')
export class Connection {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Node, { onDelete: 'CASCADE' })
  sourceNode: Node;

  @ManyToOne(() => Node, { onDelete: 'CASCADE' })
  targetNode: Node;

  @ManyToOne(() => Workflow, (workflow) => workflow.connections, { onDelete: 'CASCADE' })
  workflow: Workflow;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
