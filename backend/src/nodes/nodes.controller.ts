import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { NodeService } from './nodes.service';

@Controller('nodes')
export class NodeController {
  constructor(private readonly nodeService: NodeService) {}

  @Post()
  create(@Body() dto: CreateNodeDto) {
    return this.nodeService.create(dto);
  }

  @Get()
  findAll() {
    return this.nodeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.nodeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateNodeDto) {
    return this.nodeService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.nodeService.remove(id);
  }
}
