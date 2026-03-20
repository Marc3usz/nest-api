import { Injectable } from '@nestjs/common';
import { Product as PrismaProduct } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './products.types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private toProduct(product: PrismaProduct): Product {
    return {
      id: product.id,
      name: product.name,
      price: Number(product.price),
    };
  }

  async findAll(): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      orderBy: { id: 'asc' },
    });

    return products.map((product) => this.toProduct(product));
  }

  async findOne(id: number): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    return product ? this.toProduct(product) : null;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        price: dto.price,
      },
    });

    return this.toProduct(product);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.prisma.product.deleteMany({ where: { id } });
    return result.count > 0;
  }
}
