import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Dodaj produkt do koszyka' })
  @ApiBody({ type: AddToCartDto })
  @ApiOkResponse({ description: 'Produkt dodany do koszyka' })
  @ApiNotFoundResponse({ description: 'Produkt nie istnieje' })
  @Post('add')
  add(@Body() dto: AddToCartDto) {
    return this.cartService.add(dto);
  }

  @ApiOperation({ summary: 'Pobierz zawartosc koszyka' })
  @ApiOkResponse({ description: 'Lista elementow koszyka' })
  @Get()
  getAll() {
    return this.cartService.getItems();
  }
}
