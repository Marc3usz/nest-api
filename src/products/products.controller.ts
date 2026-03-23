import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { AdminGuard } from './guards/admin.guard';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: 'Pobierz wszystkie produkty' })
  @ApiOkResponse({ description: 'Lista produktow' })
  @Get()
  async findAll() {
    return this.productsService.findAll();
  }

  @ApiOperation({ summary: 'Pobierz pojedynczy produkt po ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiNotFoundResponse({ description: 'Produkt nie istnieje' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new NotFoundException('Produkt nie istnieje');
    }

    return product;
  }

  @ApiOperation({ summary: 'Dodaj nowy produkt' })
  @ApiBody({ type: CreateProductDto })
  @ApiOkResponse({ description: 'Utworzony produkt' })
  @Post()
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @ApiOperation({ summary: 'Usun produkt (wymaga admin key)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiHeader({
    name: 'x-admin-key',
    description: 'Klucz administratora',
    required: true,
    schema: { type: 'string', example: 'supersecret' },
  })
  @ApiNotFoundResponse({ description: 'Produkt nie istnieje' })
  @Delete(':id')
  @UseGuards(AdminGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.productsService.delete(id);
    if (!deleted) {
      throw new NotFoundException('Produkt nie istnieje');
    }

    return { message: 'Produkt usuniety' };
  }
}
