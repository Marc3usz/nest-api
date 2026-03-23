import { Injectable, NotFoundException } from '@nestjs/common';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { PrismaService } from '../prisma/prisma.service';

export interface CartItem {
  productId: number;
  quantity: number;
}

@Injectable()
export class CartService {
  private static readonly DEFAULT_CART_KEY = 'default';

  constructor(private readonly prisma: PrismaService) {}

  private normalizeCartKey(cartKey?: string): string {
    const normalized = cartKey?.trim();
    return normalized ? normalized : CartService.DEFAULT_CART_KEY;
  }

  private async ensureCart(cartKey?: string) {
    const key = this.normalizeCartKey(cartKey);
    return this.prisma.cart.upsert({
      where: { key },
      update: {},
      create: { key },
      select: { id: true, key: true },
    });
  }

  async add(cartKey: string | undefined, dto: AddToCartDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Produkt nie istnieje');
    }

    const cart = await this.ensureCart(cartKey);

    await this.prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: dto.productId,
        },
      },
      update: { quantity: { increment: dto.quantity } },
      create: {
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
      },
    });

    const items = await this.getItems(cart.key);

    return {
      message: 'Dodano do koszyka',
      cartId: cart.key,
      items,
    };
  }

  async getItems(cartKey?: string): Promise<CartItem[]> {
    const cart = await this.ensureCart(cartKey);

    return this.prisma.cartItem.findMany({
      where: { cartId: cart.id },
      orderBy: { productId: 'asc' },
      select: {
        productId: true,
        quantity: true,
      },
    });
  }
}
