import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from '../requests/request.entity';
import { ContractService } from './contract.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Request]), UsersModule],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}
