import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Workflow } from '../../workflow/entities/workflow.entity';

@Entity('nodes')
export class Node {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  type: string; // ex: "scraper", "transformer", "output"

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any>; // parâmetros configuráveis do node

  @ManyToOne(() => Workflow, (workflow) => workflow.nodes, { onDelete: 'CASCADE' })
  workflow: Workflow;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
