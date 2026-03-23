import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiHeader,
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
  @ApiHeader({
    name: 'x-cart-id',
    required: false,
    description: 'Identyfikator koszyka (domyslnie: default)',
    schema: { type: 'string', example: 'marcel-cart' },
  })
  @Post('add')
  add(
    @Headers('x-cart-id') cartKey: string | undefined,
    @Body() dto: AddToCartDto,
  ) {
    return this.cartService.add(cartKey, dto);
  }

  @ApiOperation({ summary: 'Pobierz zawartosc koszyka' })
  @ApiOkResponse({ description: 'Lista elementow koszyka' })
  @ApiHeader({
    name: 'x-cart-id',
    required: false,
    description: 'Identyfikator koszyka (domyslnie: default)',
    schema: { type: 'string', example: 'marcel-cart' },
  })
  @Get()
  getAll(@Headers('x-cart-id') cartKey: string | undefined) {
    return this.cartService.getItems(cartKey);
  }
}
