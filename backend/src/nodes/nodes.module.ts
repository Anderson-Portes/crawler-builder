import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Node } from './entities/node.entity';
import { Workflow } from '../workflow/entities/workflow.entity';
import { NodeController } from './nodes.controller';
import { NodeService } from './nodes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Node, Workflow])],
  controllers: [NodeController],
  providers: [NodeService],
})
export class NodeModule {}
