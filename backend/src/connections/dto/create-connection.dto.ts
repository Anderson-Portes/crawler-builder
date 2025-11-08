import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateConnectionDto {
  @IsNumber()
  @IsNotEmpty()
  sourceNodeId: number;

  @IsNumber()
  @IsNotEmpty()
  targetNodeId: number;

  @IsNumber()
  @IsNotEmpty()
  workflowId: number;
}
