import { Injectable, NotFoundException } from '@nestjs/common';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { PrismaService } from '../prisma/prisma.service';

export interface CartItem {
  productId: number;
  quantity: number;
}

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async add(dto: AddToCartDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Produkt nie istnieje');
    }

    await this.prisma.cartItem.upsert({
      where: { productId: dto.productId },
      update: { quantity: { increment: dto.quantity } },
      create: { productId: dto.productId, quantity: dto.quantity },
    });

    const items = await this.getItems();

    return {
      message: 'Dodano do koszyka',
      items,
    };
  }

  async getItems(): Promise<CartItem[]> {
    return this.prisma.cartItem.findMany({
      orderBy: { id: 'asc' },
      select: {
        productId: true,
        quantity: true,
      },
    });
  }
}
