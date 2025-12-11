// Archivo: src/main.ts

import 'dotenv/config'; 
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Configurar CORS (para que el Frontend pueda conectarse)
  app.enableCors({
    origin: ['http://localhost:8080', 'http://localhost:5173'], // permitir front en vite o nginx
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 2. Aplicar validación global (para que funcione el LoginDto)
  const { ValidationPipe } = await import('@nestjs/common');
  app.useGlobalPipes(new ValidationPipe());

  // 3. Establecer el prefijo global de la API (opcional, pero limpio)
  app.setGlobalPrefix('api');

  // El puerto por defecto de NestJS es 3000, pero lo vamos a cambiar para evitar conflictos
  await app.listen(4000); 
}
bootstrap();