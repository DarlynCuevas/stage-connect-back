import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BlockedDaysService } from './blocked-days.service';

@Controller('blocked-days')
export class BlockedDaysController {
  constructor(private readonly blockedDaysService: BlockedDaysService) {}

  /**
   * POST /blocked-days
   * Crear un día bloqueado
   */
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Artista', 'Manager')
  async create(
    @Body() body: { blockedDate: string },
    @Request() req,
  ) {
    const artistId = req.user?.user_id;
    const blockedDate = new Date(body.blockedDate);
    return this.blockedDaysService.create(artistId, blockedDate);
  }

  /**
   * GET /blocked-days/:artistId
   * Obtener todos los días bloqueados de un artista (público)
   */
  @Get(':artistId')
  async getBlockedDays(@Param('artistId', ParseIntPipe) artistId: number) {
    return this.blockedDaysService.findByArtistId(artistId);
  }

  /**
   * DELETE /blocked-days/:id
   * Eliminar un día bloqueado
   */
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Artista', 'Manager')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    await this.blockedDaysService.remove(id);
    return { message: 'Día bloqueado eliminado' };
  }
}
