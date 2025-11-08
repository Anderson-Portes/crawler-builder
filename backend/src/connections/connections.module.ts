import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from './entities/connection.entity';
import { Node } from '../nodes/entities/node.entity';
import { Workflow } from '../workflow/entities/workflow.entity';
import { ConnectionController } from './connections.controller';
import { ConnectionService } from './connections.service';

@Module({
  imports: [TypeOrmModule.forFeature([Connection, Node, Workflow])],
  controllers: [ConnectionController],
  providers: [ConnectionService],
})
export class ConnectionModule {}
