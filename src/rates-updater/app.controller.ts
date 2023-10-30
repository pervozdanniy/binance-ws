import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { SymbolsDto } from '../dto/symbol.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async list() {
    return this.appService.list();
  }

  @Post()
  add(@Body() { names }: SymbolsDto) {
    return this.appService.add(names);
  }

  @Delete()
  remove(@Body() { names }: SymbolsDto) {
    return this.appService.remove(names);
  }
}
