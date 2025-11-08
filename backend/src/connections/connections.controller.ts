import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { UpdateConnectionDto } from './dto/update-connection.dto';
import { ConnectionService } from './connections.service';

@Controller('connections')
export class ConnectionController {
  constructor(private readonly connectionService: ConnectionService) {}

  @Post()
  create(@Body() dto: CreateConnectionDto) {
    return this.connectionService.create(dto);
  }

  @Get()
  findAll() {
    return this.connectionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.connectionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateConnectionDto) {
    return this.connectionService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.connectionService.remove(id);
  }
}
