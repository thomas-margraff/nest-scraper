import { HttpExceptionFilter } from './../http-exception.filter';
import { Controller, Get, Post, Param, Body, UseFilters } from '@nestjs/common';
import { CreateCatDto } from './dto/CreateCatDto';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {

    constructor(private readonly catsService: CatsService) {}

    @Post()
    @UseFilters(new HttpExceptionFilter())
    async create(@Body() createCatDto: CreateCatDto) {
        this.catsService.create(createCatDto);
    }

    @Get()
    async findAll(): Promise<Cat[]> {
        return this.catsService.findall();
    }

    @Get(':id')
    findOne(@Param() params) {
        return `this section returns a #${params.id} cat`;
    }

    @Get(':id')
    findOneAgain(@Param('id') id): string {
      return `This action returns a #${id} cat`;
    }

    /*
    @Get()
        findAll(@Query() query: ListAllEntities) {
            return `This action returns all cats (limit: ${query.limit} items)`;
    }

    @Put(':id')
        update(@Param('id') id: string, @Body() updateCatDto: UpdateCatDto) {
            return `This action updates a #${id} cat`;
    }

    @Delete(':id')
        remove(@Param('id') id: string) {
            return `This action removes a #${id} cat`;
    }
    */


}
