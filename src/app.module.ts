// Archivo: src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Módulo para leer el .env
import { TypeOrmModule } from '@nestjs/typeorm'; // Módulo para la BBDD (PostgreSQL)
import { env } from 'process';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from './jwt/jwt.module';
import { RequestsModule } from './requests/requests.module';
import { BlockedDaysModule } from './blocked-days/blocked-days.module';
import { ManagerRequestsModule } from './manager-requests/manager-requests.module';
import { PublicController } from './public.controller';
import { ReviewsModule } from './reviews/reviews.module';
import { VenueDashboardModule } from './venue-dashboard/venue-dashboard.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { InterestedModule } from './interested.module';

@Module({
  imports: [
    // 1. Configura para cargar el archivo .env
    ConfigModule.forRoot({ isGlobal: true }), 
    
    // 2. Usar TypeOrmModule.forRootAsync
    TypeOrmModule.forRootAsync({
      // 3. ¡CRÍTICO! Definir qué servicio se inyecta
      imports: [ConfigModule],
      inject: [ConfigService], 
      
      // 4. Usar useFactory, donde 'configService' es el argumento que se inyectó
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        ssl: configService.get<string>('NODE_ENV') === 'production' ? true : false,
        extra:
          configService.get<string>('NODE_ENV') === 'production'
            ? { ssl: { rejectUnauthorized: false } }
            : undefined,
        
        // ... otras opciones (entities, synchronize)
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging:
          configService.get<string>('NODE_ENV') === 'production'
            ? ['error', 'warn', 'schema']
            : ['query', 'error', 'warn'],
      }),
    }),
    
    UsersModule,
    
    AuthModule,
    RequestsModule,
    BlockedDaysModule,
    ManagerRequestsModule,
    JwtModule,
    ReviewsModule,
    InterestedModule,
    VenueDashboardModule,
  ],
  controllers: [PublicController, NotificationsController],
  providers: [NotificationsService, NotificationsGateway],
})
export class AppModule {}