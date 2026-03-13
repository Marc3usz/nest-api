import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Nazwa produktu',
    example: 'Keylogger Keyboard',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Cena produktu (musi byc wieksza od 0)',
    example: 299.99,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  price: number;
}
