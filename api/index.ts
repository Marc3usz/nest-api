import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';
import serverless from 'serverless-http';
import { AppModule } from '../src/app.module';

let cachedHandler: ReturnType<typeof serverless> | null = null;

async function createHandler() {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger: ['error', 'warn', 'log'],
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Hacker Shop API')
    .setDescription('API Escape Room backend documentation')
    .setVersion('1.0')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument, {
    useGlobalPrefix: true,
  });

  await app.init();
  return serverless(expressApp);
}

export default async function handler(req: express.Request, res: express.Response) {
  if (!cachedHandler) {
    cachedHandler = await createHandler();
  }

  return cachedHandler(req, res);
}
