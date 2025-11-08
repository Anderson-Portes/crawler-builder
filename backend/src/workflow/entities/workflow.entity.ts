import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Node } from '../../nodes/entities/node.entity';
import { Connection } from '../../connections/entities/connection.entity';

@Entity('workflows')
export class Workflow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => Node, (node) => node.workflow, { cascade: true })
  nodes: Node[];

  @OneToMany(() => Connection, (connection) => connection.workflow, { cascade: true })
  connections: Connection[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
