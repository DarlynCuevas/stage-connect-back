import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interested } from './interested.entity';
import { InterestedController } from './interested.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Interested])],
  controllers: [InterestedController],
})
export class InterestedModule {}
