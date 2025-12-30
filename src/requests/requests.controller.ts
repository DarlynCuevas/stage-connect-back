import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import { plainToInstance } from 'class-transformer';
import { RequestSafeDto } from './dto/request-safe.dto';
import { Offer } from './offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';

@Controller('requests')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}
  /**
   * POST /requests/:id/offers
   * Crear una oferta o contraoferta para una solicitud
   */
  @Post(':id/offers')
  async createOffer(
    @Param('id', ParseIntPipe) requestId: number,
    @Body() createOfferDto: CreateOfferDto,
    @Request() req
  ): Promise<Offer> {
    return this.requestsService.createOffer(requestId, createOfferDto, req.user.user_id);
  }

  /**
   * GET /requests/:id/offers
   * Listar historial de ofertas de una solicitud
   */
  @Get(':id/offers')
  async getOffers(@Param('id', ParseIntPipe) requestId: number): Promise<Offer[]> {
    return this.requestsService.getOffers(requestId);
  }

  /**
   * POST /requests
   * Crear una nueva solicitud de booking
   */
  @Post()
  @Roles('Local', 'Promotor')
  async create(@Body() createRequestDto: CreateRequestDto, @Request() req) {
    const currentUserId = req.user?.user_id;
    const result = await this.requestsService.create(createRequestDto, currentUserId);
    // Sanitizar usando RequestSafeDto
    return plainToInstance(RequestSafeDto, result, { excludeExtraneousValues: true });
  }

  /**
   * GET /requests
   * Obtener todas las solicitudes del usuario logueado (artista, local, promotor, manager)
   */
  @Get()
  @Roles('Artista', 'Local', 'Promotor', 'Manager')
  async getUserRequests(@Request() req) {
    const currentUserId = req.user?.user_id;
    const userRole = req.user?.role;
    return this.requestsService.getUserRequestsSanitized(currentUserId, userRole);
  }

  /**
   * GET /requests/sent
   * Obtener todas las solicitudes enviadas por el local/promotor logueado
   */
  @Get('sent')
  @Roles('Local', 'Promotor')
  async getSentRequests(@Request() req) {
    const currentUserId = req.user?.user_id;
    const result = await this.requestsService.findBySenderUserId(currentUserId);
    return plainToInstance(RequestSafeDto, result, { excludeExtraneousValues: true });
  }

  /**
   * GET /requests/confirmed/:artistId
   * Obtener todas las solicitudes confirmadas de un artista (público)
   */
  @Get('confirmed/:artistId')
  async getConfirmedRequests(@Param('artistId', ParseIntPipe) artistId: number) {
    const requests = await this.requestsService.findConfirmedByArtistId(artistId);
    // Sanitizar artist y requester en cada request
    const sanitizeUser = (user: any) => {
      if (!user) return user;
      const { password, passwordHash, password_hash, email, ...rest } = user;
      return rest;
    };
    return requests.map(req => ({
      ...req,
      artist: sanitizeUser(req.artist),
      requester: sanitizeUser(req.requester),
    }));
  }

  /**
   * GET /requests/confirmed-venue/:venueId
   * Obtener todas las solicitudes confirmadas de un venue (local/promotor)
   */
  @Get('confirmed-venue/:venueId')
  async getConfirmedRequestsByVenue(@Param('venueId', ParseIntPipe) venueId: number) {
    return this.requestsService.findConfirmedByVenueId(venueId);
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

