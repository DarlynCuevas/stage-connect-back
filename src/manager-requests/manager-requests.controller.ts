import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ManagerRequestsService } from './manager-requests.service';
import { CreateManagerRequestDto } from './dto/create-manager-request.dto';
import { UpdateManagerRequestStatusDto } from './dto/update-manager-request-status.dto';

@Controller('manager-requests')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ManagerRequestsController {
  constructor(private readonly managerRequestsService: ManagerRequestsService) {}

  /**
   * POST /manager-requests
   * Crear una nueva solicitud manager-artista
   */
  @Post()
  @Roles('Manager', 'Artista')
  async create(@Body() createDto: CreateManagerRequestDto, @Request() req) {
    const currentUserId = req.user?.user_id;
    return this.managerRequestsService.create(createDto, currentUserId);
  }

  /**
   * GET /manager-requests/received
   * Obtener solicitudes recibidas
   */
  @Get('received')
  @Roles('Manager', 'Artista')
  async getReceived(@Request() req) {
    const currentUserId = req.user?.user_id;
    return this.managerRequestsService.findReceived(currentUserId);
  }

  /**
   * GET /manager-requests/sent
   * Obtener solicitudes enviadas
   */
  @Get('sent')
  @Roles('Manager', 'Artista')
  async getSent(@Request() req) {
    const currentUserId = req.user?.user_id;
    return this.managerRequestsService.findSent(currentUserId);
  }

  /**
   * PATCH /manager-requests/:id/status
   * Actualizar el estado de una solicitud (aceptar/rechazar)
   */
  @Patch(':id/status')
  @Roles('Manager', 'Artista')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() statusDto: UpdateManagerRequestStatusDto,
    @Request() req,
  ) {
    const currentUserId = req.user?.user_id;
    return this.managerRequestsService.updateStatus(id, statusDto, currentUserId);
  }

  /**
   * DELETE /manager-requests/sent
   * Eliminar todas las solicitudes pendientes enviadas por el usuario
   */
  @Delete('sent')
  @Roles('Manager')
  async deleteAllSent(@Request() req) {
    const currentUserId = req.user?.user_id;
    return this.managerRequestsService.deleteAllSentRequests(currentUserId);
  }

  /**
   * DELETE /manager-requests/:id
   * Eliminar una solicitud enviada (solo el remitente puede hacerlo)
   */
  @Delete(':id')
  @Roles('Manager')
  async deleteSent(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const currentUserId = req.user?.user_id;
    return this.managerRequestsService.deleteSentRequest(id, currentUserId);
  }

  /**
   * DELETE /manager-requests/relation/:artistId
   * Eliminar la relación manager-artista
   */
  @Delete('relation/:artistId')
  @Roles('Manager', 'Artista')
  async removeRelation(
    @Param('artistId', ParseIntPipe) artistId: number,
    @Request() req,
  ) {
    const currentUserId = req.user?.user_id;
    await this.managerRequestsService.removeRelation(artistId, currentUserId);
    return { message: 'Relación eliminada correctamente' };
  }
}
