import { Body, Controller, Post, Get, Param, Patch, Delete } from '@nestjs/common';



import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interested, InterestedStatus } from './interested.entity';


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
    return { id, status: body.status };
  }

    @Get('venue/:venueId')
  async getInterestedByVenue(@Param('venueId') venueId: number) {
    return this.interestedRepo.find({
      where: { venueId },
      relations: ['manager', 'artist', 'venue'],
      order: { createdAt: 'DESC' },
    });
  }

    @Delete(':id')
  async deleteInterested(@Param('id') id: number) {
    await this.interestedRepo.delete(id);
    return { id, deleted: true };
  }
}
