import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockedDay } from './blocked-day.entity';
import { User } from '../users/user.entity';

@Injectable()
export class BlockedDaysService {
  constructor(
    @InjectRepository(BlockedDay)
    private readonly blockedDayRepository: Repository<BlockedDay>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Crear un día bloqueado para un artista
   */
  async create(artistId: number, blockedDate: Date): Promise<BlockedDay> {
    // Validar que el artista existe
    const artist = await this.usersRepository.findOne({
      where: { user_id: artistId },
    });
    if (!artist) {
      throw new NotFoundException('El artista no existe.');
    }

    // Verificar si el día ya está bloqueado
    const existing = await this.blockedDayRepository.findOne({
      where: {
        artist: { user_id: artistId },
        blockedDate: blockedDate,
      },
    });

    if (existing) {
      return existing;
    }

    const blockedDay = this.blockedDayRepository.create({
      artist,
      blockedDate,
    });

    return this.blockedDayRepository.save(blockedDay);
  }

  /**
   * Obtener todos los días bloqueados de un artista
   */
  async findByArtistId(artistId: number): Promise<BlockedDay[]> {
    return this.blockedDayRepository.find({
      where: {
        artist: {
          user_id: artistId,
        },
      },
      relations: ['artist'],
      order: {
        blockedDate: 'ASC',
      },
    });
  }

  /**
   * Eliminar un día bloqueado
   */
  async remove(blockedDayId: number): Promise<void> {
    const result = await this.blockedDayRepository.delete(blockedDayId);
    if (result.affected === 0) {
      throw new NotFoundException('Día bloqueado no encontrado.');
    }
  }

  /**
   * Eliminar un día bloqueado por fecha
   */
  async removeByDate(artistId: number, blockedDate: Date): Promise<void> {
    const result = await this.blockedDayRepository.delete({
      artist: { user_id: artistId },
      blockedDate: blockedDate,
    });
    if (result.affected === 0) {
      throw new NotFoundException('Día bloqueado no encontrado.');
    }
  }
}
