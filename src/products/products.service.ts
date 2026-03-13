import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './products.types';

@Injectable()
export class ProductsService {
  private products: Product[] = [
    { id: 1, name: 'Keylogger Keyboard', price: 299.99 },
    { id: 2, name: 'Stealth Hoodie', price: 149.5 },
    { id: 3, name: 'Exploit Mug', price: 39.99 },
    { id: 4, name: 'Packet Sniffer Lamp', price: 219.0 },
    { id: 5, name: 'Zero-Day Stickers', price: 19.99 },
  ];

  findAll(): Product[] {
    return this.products;
  }

  findOne(id: number): Product | undefined {
    return this.products.find((product) => product.id === id);
  }

  create(dto: CreateProductDto): Product {
    const nextId =
      this.products.length > 0
        ? Math.max(...this.products.map((product) => product.id)) + 1
        : 1;

    const newProduct: Product = {
      id: nextId,
      name: dto.name,
      price: dto.price,
    };

    this.products.push(newProduct);
    return newProduct;
  }

  delete(id: number): boolean {
    const initialLength = this.products.length;
    this.products = this.products.filter((product) => product.id !== id);
    return this.products.length !== initialLength;
  }
}
