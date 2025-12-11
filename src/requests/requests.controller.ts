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
  async create(@Body() createRequestDto: CreateRequestDto) {
    return this.requestsService.create(createRequestDto);
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
   * GET /requests/:id
   * Obtener una solicitud específica por ID
   */
  @Get(':id')
  async getRequestById(@Param('id', ParseIntPipe) id: number) {
    return this.requestsService.findOne(id);
  }

  /**
   * PATCH /requests/:id/status
   * Actualizar el estado de una solicitud (solo artista)
   */
  @Roles('Artista')
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() statusDto: UpdateRequestStatusDto,
    @Request() req,
  ) {
    const currentUserId = req.user?.user_id;
    return this.requestsService.updateStatus(id, statusDto, currentUserId);
  }
}

