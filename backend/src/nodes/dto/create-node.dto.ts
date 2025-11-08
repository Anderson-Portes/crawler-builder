import { IsNotEmpty, IsString, IsOptional, IsObject, IsNumber } from 'class-validator';

export class CreateNodeDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;

  @IsNumber()
  @IsNotEmpty()
  workflowId: number;
}
