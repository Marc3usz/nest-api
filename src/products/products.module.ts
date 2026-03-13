import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AdminGuard } from './guards/admin.guard';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, AdminGuard],
  exports: [ProductsService],
})
export class ProductsModule {}
