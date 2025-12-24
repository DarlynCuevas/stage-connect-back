
import { Body, Controller, Post, Get, Param, Patch, Delete, Inject, forwardRef } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { InterestedSafeDto } from './interested/dto/interested-safe.dto';

import { Repository } from 'typeorm';
 
import { Interested, InterestedStatus } from './interested.entity';
import { NotificationsGateway } from './notifications.gateway';
import { UsersService } from './users/users.service';
import { InjectRepository } from '@nestjs/typeorm';


interface CreateInterestedDto {
  venueId: number;
  managerId?: number;
  artistIds: number[];
  date: string;
  price?: number;

}

@Controller('interested')
export class InterestedController {
  constructor(
    @InjectRepository(Interested)
    private readonly interestedRepo: Repository<Interested>,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async createInterested(@Body() body: CreateInterestedDto) {
    const { venueId, managerId, artistIds, date, price } = body;
    const interestedList: Interested[] = [];
    for (const artistId of artistIds) {
      const interested = this.interestedRepo.create({
        venueId,
        managerId: managerId ?? null,
        artistId,
        date,
        price: price ?? null,
        status: 'pending',
      });
      interestedList.push(interested);
    }
    return this.interestedRepo.save(interestedList);
  }

  @Patch(':id')
  async updateInterestedStatus(
    @Param('id') id: number,
    @Body() body: { status: InterestedStatus }
  ) {
    await this.interestedRepo.update(id, { status: body.status });

    // Si el estado es 'accepted', emitir notificación al local
    if (body.status === 'accepted') {
      // Buscar el registro con relaciones
      const interested = await this.interestedRepo.findOne({
        where: { id },
        relations: ['artist', 'artist.user', 'venue'],
      });
      if (interested) {
        // Obtener nombre del artista
        let artistName = interested.artist?.nickName || interested.artist?.user?.name || 'Artista';
        // Emitir notificación al local (venue)
        this.notificationsGateway.server.to(`user:${interested.venueId}`).emit('notification.artist-interested', {
          message: `${artistName} está interesado para el día ${interested.date}`,
          artistId: interested.artistId,
          date: interested.date,
        });
      }
    }
    return { id, status: body.status };
  }

  @Get('venue/:venueId')
  async getInterestedByVenue(@Param('venueId') venueId: number) {
    const result = await this.interestedRepo.find({
      where: { venueId },
      relations: ['manager', 'artist', 'artist.user', 'venue'],
      order: { createdAt: 'DESC' },
    });
    return plainToInstance(InterestedSafeDto, result, { excludeExtraneousValues: true });
  }
  
  @Delete(':id')
  async deleteInterested(@Param('id') id: number) {
    await this.interestedRepo.delete(id);
    return { id, deleted: true };
  }

    @Get('artist/:artistId')
    async getInterestedByArtist(@Param('artistId') artistId: number) {
      const result = await this.interestedRepo.find({
        where: { artistId },
        relations: ['manager', 'artist', 'artist.user', 'venue', 'venue.user'],
        order: { createdAt: 'DESC' },
      });
      // Map venue.user fields into venue for each interested
      const mapped = result.map((item) => {
        let venueData = {};
        if (item.venue && item.venue.user) {
          venueData = {
            user_id: item.venue.user.user_id,
            name: item.venue.user.name,
            avatar: item.venue.user.avatar,
            city: item.venue.user.city,
            country: item.venue.user.country,
          };
        }
        return {
          ...item,
          venue: venueData ?? null,
        };
      });
      return plainToInstance(InterestedSafeDto, mapped, { excludeExtraneousValues: true });
    }
}
