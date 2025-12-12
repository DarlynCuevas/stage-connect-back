// Archivo: src/main.ts

import 'dotenv/config'; 
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { readFileSync, existsSync } from 'fs';

async function bootstrap() {
  // Fallback: si JWT_SECRET no está en env, intentamos cargar desde Secret Files de Render
  if (!process.env.JWT_SECRET) {
    const secretFilePath = '/etc/secrets/JWT_SECRET';
    try {
      if (existsSync(secretFilePath)) {
        const content = readFileSync(secretFilePath, 'utf-8').trim();
        if (content) {
          process.env.JWT_SECRET = content;
        }
      }
    } catch {}
  }

  const app = await NestFactory.create(AppModule);

  // 1. Configurar CORS (para que el Frontend pueda conectarse)
  app.enableCors({
    origin: [
      'http://localhost:8080',
      'http://localhost:5173',
      'https://darlyncuevas.github.io',
      'https://darlyncuevas.github.io/stage-connect',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 2. Aplicar validación global (para que funcione el LoginDto)
  const { ValidationPipe } = await import('@nestjs/common');
  app.useGlobalPipes(new ValidationPipe());

  // 3. Establecer el prefijo global de la API (opcional, pero limpio)
  app.setGlobalPrefix('api');

  // Usar PORT de entorno si está disponible; si no, 4000
  const port = Number(process.env.PORT || 4000);
  // Escuchar en 0.0.0.0 para que Render detecte el puerto
  await app.listen(port, '0.0.0.0');
}
bootstrap();