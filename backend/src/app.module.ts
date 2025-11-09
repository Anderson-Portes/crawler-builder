import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import path from 'path';
import { WorkflowModule } from './workflow/workflow.module';
import { NodeModule } from './nodes/nodes.module';
import { ConnectionModule } from './connections/connections.module';
import { WorkflowExecutorModule } from './workflow-executor/workflow-executor.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        autoLoadEntities: true,
        synchronize: true,
        entities: [path.join(__dirname, '**', '*.entity.{ts,js}')],
      }),
    }),
    WorkflowModule,
    NodeModule,
    ConnectionModule,
    WorkflowExecutorModule,
  ],
})
export class AppModule {}
