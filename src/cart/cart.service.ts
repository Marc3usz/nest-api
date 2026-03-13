import { Injectable, NotFoundException } from '@nestjs/common';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { ProductsService } from '../products/products.service';

export interface CartItem {
  productId: number;
  quantity: number;
}

@Injectable()
export class CartService {
  private readonly items: CartItem[] = [];

  constructor(private readonly productsService: ProductsService) {}

  add(dto: AddToCartDto) {
    const product = this.productsService.findOne(dto.productId);
    if (!product) {
      throw new NotFoundException('Produkt nie istnieje');
    }

    const existingItem = this.items.find(
      (item) => item.productId === dto.productId,
    );

    if (existingItem) {
      existingItem.quantity += dto.quantity;
    } else {
      this.items.push({ productId: dto.productId, quantity: dto.quantity });
    }

    return {
      message: 'Dodano do koszyka',
      items: this.items,
    };
  }

  getItems() {
    return this.items;
  }
}
