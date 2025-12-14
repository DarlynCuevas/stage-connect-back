import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';

@Controller('requests')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  /**
   * POST /requests
   * Crear una nueva solicitud de booking
   */
  @Post()
  @Roles('Local', 'Promotor')
  async create(@Body() createRequestDto: CreateRequestDto, @Request() req) {
    const currentUserId = req.user?.user_id;
    return this.requestsService.create(createRequestDto, currentUserId);
  }

  /**
   * GET /requests
   * Obtener todas las solicitudes del artista logueado
   */
  @Get()
  @Roles('Artista')
  async getArtistRequests(@Request() req) {
    const currentUserId = req.user?.user_id;
    return this.requestsService.findByArtistUserId(currentUserId);
  }

  /**
   * GET /requests/sent
   * Obtener todas las solicitudes enviadas por el local/promotor logueado
   */
  @Get('sent')
  @Roles('Local', 'Promotor')
  async getSentRequests(@Request() req) {
    const currentUserId = req.user?.user_id;
    return this.requestsService.findBySenderUserId(currentUserId);
  }

  /**
   * GET /requests/confirmed/:artistId
   * Obtener todas las solicitudes confirmadas de un artista (público)
   */
  @Get('confirmed/:artistId')
  async getConfirmedRequests(@Param('artistId', ParseIntPipe) artistId: number) {
    return this.requestsService.findConfirmedByArtistId(artistId);
  }

  /**
   * GET /requests/:id
   * Obtener una solicitud específica por ID
   */
  @Get(':id')
  async getRequestById(@Param('id', ParseIntPipe) id: number) {
    return this.requestsService.findOne(id);
  }

  /**
   * PATCH /requests/:id/status
   * Actualizar el estado de una solicitud (artista o su manager)
   */
  @Roles('Artista', 'Manager', 'Local')
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() statusDto: UpdateRequestStatusDto,
    @Request() req,
  ) {
    const currentUserId = req.user?.user_id;
    return this.requestsService.updateStatus(id, statusDto, currentUserId);
  }

  /**
   * GET /requests/manager/all
   * Obtener todas las solicitudes de los artistas del manager
   */
  @Get('manager/all')
  @Roles('Manager')
  async getManagerRequests(@Request() req) {
    const currentUserId = req.user?.user_id;
    return this.requestsService.findByManagerId(currentUserId);
  }

  /**
   * GET /requests/manager/stats
   * Obtener estadísticas del manager
   */
  @Get('manager/stats')
  @Roles('Manager')
  async getManagerStats(@Request() req) {
    const currentUserId = req.user?.user_id;
    return this.requestsService.getManagerStats(currentUserId);
  }
}

