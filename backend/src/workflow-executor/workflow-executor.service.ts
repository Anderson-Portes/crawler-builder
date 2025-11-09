import { Injectable } from '@nestjs/common';
import { WORKFLOW_EXECUTOR_QUEUE } from './workflow-executor.constants';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class WorkflowExecutorService {
  constructor(@InjectQueue(WORKFLOW_EXECUTOR_QUEUE) private queue: Queue) {}
  async enqueue(workflowId: number) {
    await this.queue.add('execute-workflow', { workflowId });
  }

  async execute(workflowId: number) {
    // Lógica para executar o workflow com o ID fornecido
    console.log(`Executando o workflow com ID: ${workflowId}`);
    // Simulação de execução do workflow
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(`Workflow com ID: ${workflowId} executado com sucesso.`);
  }
}
