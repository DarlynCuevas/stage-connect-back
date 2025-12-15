import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserFiscalData } from './user-fiscal-data.entity';
import { CreateUserFiscalDataDto, UpdateUserFiscalDataDto } from '../users/dto/user-fiscal-data.dto';

@Injectable()
export class UserFiscalDataService {
  constructor(
    @InjectRepository(UserFiscalData)
    private readonly userFiscalDataRepository: Repository<UserFiscalData>,
  ) {}

  async create(createDto: CreateUserFiscalDataDto): Promise<UserFiscalData> {
    // Mapear el user (number) del DTO a un objeto User
    const { user, ...rest } = createDto;
    const fiscalData = this.userFiscalDataRepository.create({
      ...rest,
      user: { user_id: user },
    });
    return this.userFiscalDataRepository.save(fiscalData);
  }

  async findByUserId(userId: number): Promise<UserFiscalData | null> {
    return this.userFiscalDataRepository.findOne({ where: { user: { user_id: userId } } });
  }

  async update(userId: number, updateDto: UpdateUserFiscalDataDto): Promise<UserFiscalData | null> {
    const fiscalData = await this.findByUserId(userId);
    if (!fiscalData) return null;
    Object.assign(fiscalData, updateDto);
    return this.userFiscalDataRepository.save(fiscalData);
  }
}
