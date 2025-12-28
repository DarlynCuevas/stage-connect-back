// Sanitiza el usuario para no exponer campos sensibles
export function sanitizeUserResponse(user: any) {
  if (!user) return user;
  const { passwordHash, password_hash, ...rest } = user;
  return rest;
}
// Archivo: src/users/users.service.ts

import { Injectable } from '@nestjs/common';
import cloudinary, { getCloudinaryPublicId } from '../lib/cloudinary';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { User, UserRole } from './user.entity';
import { ArtistProfile } from './artist-profile.entity';
import { ManagerProfile } from './manager-profile.entity';
import { VenueProfile } from './venue-profile.entity';
import { PromoterProfile } from './promoter-profile.entity';
import { discoveryBlocks } from './discovery.utils';
import { CreateUserInterface } from './dto/create-user.interface';
import { Request } from '../requests/request.entity';
import { BlockedDay } from '../blocked-days/blocked-day.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(ArtistProfile)
    private artistProfileRepository: Repository<ArtistProfile>,
    @InjectRepository(ManagerProfile)
    private managerProfileRepository: Repository<ManagerProfile>,
    @InjectRepository(VenueProfile)
    private venueProfileRepository: Repository<VenueProfile>,
    @InjectRepository(PromoterProfile)
    private promoterProfileRepository: Repository<PromoterProfile>,
    @InjectRepository(Request)
    private requestsRepository: Repository<Request>,
    @InjectRepository(BlockedDay)
    private blockedDaysRepository: Repository<BlockedDay>,
  ) {}

  // Método usado por AuthService para verificar si el email ya existe
  async findOneByEmail(email: string): Promise<User | null> {
    // Make email lookup case-insensitive
    return this.usersRepository.createQueryBuilder('user')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .getOne();
  }

    // Añadir un usuario a favoritos
    async addFavorite(userId: number, favoriteUserId: number): Promise<any> {
      if (userId === favoriteUserId) throw new Error('No puedes marcarte a ti mismo como favorito');
      const user = await this.usersRepository.findOne({ where: { user_id: userId }, relations: ['favorites'] });
      const favoriteUser = await this.usersRepository.findOne({ where: { user_id: favoriteUserId } });
      if (!user || !favoriteUser) throw new Error('Usuario no encontrado');
      if (user.favorites?.some(u => u.user_id === favoriteUserId)) return { message: 'Ya es favorito' };
      user.favorites = [...(user.favorites || []), favoriteUser];
      await this.usersRepository.save(user);
      return { message: 'Favorito añadido' };
    }

    // Eliminar un usuario de favoritos
    async removeFavorite(userId: number, favoriteUserId: number): Promise<any> {
      const user = await this.usersRepository.findOne({ where: { user_id: userId }, relations: ['favorites'] });
      if (!user) throw new Error('Usuario no encontrado');
      user.favorites = (user.favorites || []).filter(u => u.user_id !== favoriteUserId);
      await this.usersRepository.save(user);
      return { message: 'Favorito eliminado' };
    }

    // Listar favoritos de un usuario
    async getFavorites(userId: number): Promise<User[]> {
      const user = await this.usersRepository.findOne({ where: { user_id: userId }, relations: ['favorites'] });
      if (!user) throw new Error('Usuario no encontrado');
      return user.favorites || [];
    }

    // Listar quién ha marcado a un usuario como favorito
    async getFavoritedBy(userId: number): Promise<User[]> {
      const user = await this.usersRepository.findOne({ where: { user_id: userId }, relations: ['favoritedBy'] });
      if (!user) throw new Error('Usuario no encontrado');
      return user.favoritedBy || [];
    }

  // Método usado por AuthService para crear el registro
  async create(createUserDto: CreateUserInterface): Promise<User> {
    const newUser = this.usersRepository.create(createUserDto); 
    const savedUser = await this.usersRepository.save(newUser);

    // Create corresponding profile based on role
    switch (savedUser.role) {
      case 'Artista':
        const artistProfile = this.artistProfileRepository.create({
          user_id: savedUser.user_id,
        });
        await this.artistProfileRepository.save(artistProfile);
        break;
      case 'Manager':
        const managerProfile = this.managerProfileRepository.create({
          user_id: savedUser.user_id,
        });
        await this.managerProfileRepository.save(managerProfile);
        break;
      case 'Local':
        const venueProfile = this.venueProfileRepository.create({
          user_id: savedUser.user_id,
        });
        await this.venueProfileRepository.save(venueProfile);
        break;
      case 'Promotor':
        const promoterProfile = this.promoterProfileRepository.create({
          user_id: savedUser.user_id,
        });
        await this.promoterProfileRepository.save(promoterProfile);
        break;
    }

    return savedUser;
  }

  // Otros métodos de usuario...

  // Obtener usuario por id con su perfil correspondiente
  async findById(id: number): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { user_id: id } });
    
    if (!user) {
      return null;
    }


    // Load corresponding profile based on role
    const userWithProfile = await this.loadUserProfile(user);
    return userWithProfile;
  }

  // Helper method to load user profile based on role
  private async loadUserProfile(user: User): Promise<any> {
    let profile: any = null;

    switch (user.role) {
      case 'Artista': {
        profile = await this.artistProfileRepository.findOne({
          where: { user_id: user.user_id },
        });
        let merged = profile ? { ...user, ...profile, managerId: profile.managerId } : { ...user };
        // Forzar avatar y banner del user base
        merged.avatar = user.avatar;
        merged.banner = user.banner;
        return merged;
      }
      case 'Manager': {
        profile = await this.managerProfileRepository.findOne({
          where: { user_id: user.user_id },
        });
        let merged = profile ? { ...user, ...profile } : { ...user };
        merged.avatar = user.avatar;
        merged.banner = user.banner;
        return merged;
      }
      case 'Local': {
        profile = await this.venueProfileRepository.findOne({
          where: { user_id: user.user_id },
        });
        let merged = profile ? { ...user, ...profile } : { ...user };
        merged.avatar = user.avatar;
        merged.banner = user.banner;
        return merged;
      }
      case 'Promotor': {
        profile = await this.promoterProfileRepository.findOne({
          where: { user_id: user.user_id },
        });
        let merged = profile ? { ...user, ...profile } : { ...user };
        merged.avatar = user.avatar;
        merged.banner = user.banner;
        return merged;
      }
      default:
        return user;
    }
  }

  // Actualizar perfil de usuario
  async updateProfile(userId: number, updateData: Partial<User>): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { user_id: userId } });
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Campos comunes (banner y avatar en users)
    const commonFields = ['name', 'bio', 'country', 'city', 'avatar', 'banner', 'gender'];
    const userUpdates: any = {};
    const profileUpdates: any = {};

    // Separar updates
    Object.keys(updateData).forEach(key => {
      if (commonFields.includes(key)) {
        userUpdates[key] = updateData[key];
      } else {
        profileUpdates[key] = updateData[key];
      }
    });

    // Borrar imagen anterior si cambia avatar o banner
    for (const field of ['avatar', 'banner']) {
      if (userUpdates[field] && user[field] && userUpdates[field] !== user[field]) {
        const publicId = getCloudinaryPublicId(user[field]);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.error(`Error borrando ${field} anterior de Cloudinary:`, err);
          }
        }
      }
    }

    // Actualizar user
    if (Object.keys(userUpdates).length > 0) {
      Object.assign(user, userUpdates);
      await this.usersRepository.save(user);
    }

    // Update corresponding profile
    if (Object.keys(profileUpdates).length > 0) {
      switch (user.role) {
        case 'Artista':
          const artistProfile = await this.artistProfileRepository.findOne({
            where: { user_id: userId },
          });
          if (artistProfile) {
            Object.assign(artistProfile, profileUpdates);
            await this.artistProfileRepository.save(artistProfile);
          } else {
            const newProfile = this.artistProfileRepository.create({
              user_id: userId,
              ...profileUpdates,
            });
            await this.artistProfileRepository.save(newProfile);
          }
          break;
        case 'Manager':
          const managerProfile = await this.managerProfileRepository.findOne({
            where: { user_id: userId },
          });
          if (managerProfile) {
            Object.assign(managerProfile, profileUpdates);
            await this.managerProfileRepository.save(managerProfile);
          } else {
            const newProfile = this.managerProfileRepository.create({
              user_id: userId,
              ...profileUpdates,
            });
            await this.managerProfileRepository.save(newProfile);
          }
          break;
        case 'Local':
          const venueProfile = await this.venueProfileRepository.findOne({
            where: { user_id: userId },
          });
          if (venueProfile) {
            Object.assign(venueProfile, profileUpdates);
            await this.venueProfileRepository.save(venueProfile);
          } else {
            const newProfile = this.venueProfileRepository.create({
              user_id: userId,
              ...profileUpdates,
            });
            await this.venueProfileRepository.save(newProfile);
          }
          break;
        case 'Promotor':
          const promoterProfile = await this.promoterProfileRepository.findOne({
            where: { user_id: userId },
          });
          if (promoterProfile) {
            Object.assign(promoterProfile, profileUpdates);
            await this.promoterProfileRepository.save(promoterProfile);
          } else {
            const newProfile = this.promoterProfileRepository.create({
              user_id: userId,
              ...profileUpdates,
            });
            await this.promoterProfileRepository.save(newProfile);
          }
          break;
      }
    }

    // Return updated user with profile, sanitized
    const result = await this.findById(userId);
    return sanitizeUserResponse(result);
  }

  // Eliminar usuario por id (propio) - CASCADE eliminará el perfil automáticamente
  async deleteUser(userId: number): Promise<void> {
    // Remove related requests where user is artist or requester
    await this.requestsRepository.delete({ artist: { user_id: userId } as any });
    await this.requestsRepository.delete({ requester: { user_id: userId } as any });

    // Remove blocked days by this artist
    await this.blockedDaysRepository.delete({ artist: { user_id: userId } as any });

    // Remove user (CASCADE will delete profile automatically)
    await this.usersRepository.delete({ user_id: userId });
  }

  // Buscar usuarios por rol (ej. 'Artista', 'Local', 'Promotor')
  async findByRole(role: string): Promise<any[]> {
    const users = await this.usersRepository.find({ where: { role: role as UserRole } });
    
    // Load profiles for each user
    const usersWithProfiles = await Promise.all(
      users.map(user => this.loadUserProfile(user))
    );
    
    return usersWithProfiles;
  }

  // Buscar usuarios por rol con filtros (búsqueda server-side)
  async findByRoleWithFilters(
    role: string,
    filters: {
      query?: string;
      genre?: string[];
      country?: string;
      city?: string;
      priceMin?: number;
      priceMax?: number;
      featured?: boolean;
      verified?: boolean;
      favorite?: boolean;
      date?: string;
      page?: number;
      pageSize?: number;
    },
  ): Promise<any> {
    // Base query for users
    const qb = this.usersRepository.createQueryBuilder('user');
    qb.where('user.role = :role', { role });

    // Si es artista, hacer LEFT JOIN a artist_profile para poder filtrar por nickName
    if (role === 'Artista') {
      qb.leftJoin('artist_profiles', 'profile', 'profile.user_id = user.user_id');
    }

    if (filters.query) {
        // Log de nombres y nicknames de los usuarios encontrados antes del filtrado por query
      // Buscar solo por nombre o nickname (no email ni ciudad)
      const words = filters.query
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .split(/\s+/)
        .map(w => w.trim())
        .filter(Boolean);
      if (words.length > 0) {
        const params: Record<string, string> = {};
        if (words.length === 1) {
          params['q'] = `%${words[0]}%`;
          if (role === 'Local') {
            qb.andWhere(`unaccent(LOWER(user.name)) ILIKE unaccent(:q)`, params);
          } else if (role === 'Artista') {
            qb.andWhere(`(
              unaccent(LOWER(user.name)) ILIKE unaccent(:q)
              OR unaccent(LOWER(profile.nick_name)) ILIKE unaccent(:q)
            )`, params);
          } else {
            qb.andWhere(`unaccent(LOWER(user.name)) ILIKE unaccent(:q)`, params);
          }
        } else {
          const orConditions: string[] = [];
          words.forEach((word, idx) => {
            const param = `q${idx}`;
            params[param] = `%${word}%`;
            if (role === 'Local') {
              orConditions.push(`unaccent(LOWER(user.name)) ILIKE unaccent(:${param})`);
            } else if (role === 'Artista') {
              orConditions.push(`(
                unaccent(LOWER(user.name)) ILIKE unaccent(:${param})
                OR unaccent(LOWER(profile.nick_name)) ILIKE unaccent(:${param})
              )`);
            } else {
              orConditions.push(`unaccent(LOWER(user.name)) ILIKE unaccent(:${param})`);
            }
          });
          qb.andWhere(orConditions.join(' OR '), params);
        }
      }
    }

    if (filters.country) {
      qb.andWhere(
        "unaccent(lower(user.country)) = unaccent(lower(:country)) AND user.country IS NOT NULL AND user.country != ''",
        { country: filters.country }
      );
    }

    if (filters.city && filters.city !== 'undefined' && filters.city !== '' && filters.city !== undefined) {
      qb.andWhere('user.city = :city', { city: filters.city });
    }

    // No ordenamos aún, para poder calcular populares y destacados
    const users = await qb.getMany();
    // Log de nombres y nicknames de los usuarios encontrados antes del filtrado por query
    if (role === 'Artista') {
    }



    // Para managers, cargar perfil y filtrar por featured, verified y favorite si corresponde
    if (role === 'Manager' || role === 'Promotor' || role === 'Promoter') {
      let usersWithProfiles;
      if (role === 'Manager') {
        usersWithProfiles = await Promise.all(
          users.map(async (user) => {
            const profile = await this.managerProfileRepository.findOne({ where: { user_id: user.user_id } });
            return {
              ...user,
              ...profile,
            };
          })
        );
      } else {
        usersWithProfiles = await Promise.all(
          users.map(async (user) => {
            const profile = await this.promoterProfileRepository.findOne({ where: { user_id: user.user_id } });
            return {
              ...user,
              ...profile,
            };
          })
        );
      }

      // Filtrar por featured si se solicita
      if (filters.featured !== undefined) {
        usersWithProfiles = usersWithProfiles.filter((u) => u.featured !== undefined && u.featured === filters.featured);
      }

      // Simular totalReviews si no existe (para pruebas y paginación)
      const withReviews = usersWithProfiles.map((u, idx) => ({
        ...u,
        totalReviews: ('totalReviews' in u && (u as any).totalReviews !== undefined ? (u as any).totalReviews : Math.floor(Math.random() * 100))
      }));

      // Usar función genérica discoveryBlocks
      return discoveryBlocks(withReviews, {
        reviewsCountKey: 'totalReviews',
        createdAtKey: 'createdAt',
        idKey: 'user_id',
        page: (filters as any).page ? Number((filters as any).page) : 1,
        pageSize: (filters as any).pageSize ? Number((filters as any).pageSize) : 20,
      });
    }

    // Para venues (Local), agrupar igual que artistas
    if (role === 'Local') {
      // JOIN con venue_profiles para obtener type y capacity
      const userIds = users.map(u => u.user_id);
      const profiles = userIds.length > 0 ? await this.venueProfileRepository.find({ where: { user_id: In(userIds) } }) : [];
      const profileMap = new Map(profiles.map(p => [p.user_id, p]));

      let usersWithProfiles = users.map(u => ({
        ...u,
        type: profileMap.get(u.user_id)?.type || null,
        capacity: profileMap.get(u.user_id)?.capacity || null,
      }));

      // Simular reviewsCount si no existe (para pruebas y paginación)
      const withReviews = usersWithProfiles.map((u, idx) => ({
        ...u,
        reviewsCount: ('reviewsCount' in u && (u as any).reviewsCount !== undefined ? (u as any).reviewsCount : Math.floor(Math.random() * 100))
      }));

      // Usar función genérica discoveryBlocks con page y pageSize originales
      const page = (filters as any).page ? Number((filters as any).page) : 1;
      const pageSize = (filters as any).pageSize ? Number((filters as any).pageSize) : 20;
      const discovery = discoveryBlocks(withReviews, {
        reviewsCountKey: 'reviewsCount',
        createdAtKey: 'createdAt',
        idKey: 'user_id',
        page,
        pageSize,
      });

      // Obtener la ciudad del usuario desde los filtros
      const ciudadUsuario = filters.city ? filters.city.toLowerCase() : null;
      let enCiudad: typeof withReviews = [];
      if (ciudadUsuario) {
        const idsYaMostrados = new Set([
          ...discovery.populares.map(a => a.user_id),
          ...discovery.destacados.map(a => a.user_id)
        ]);
        enCiudad = withReviews.filter(
          a => a.city && a.city.toLowerCase() === ciudadUsuario && !idsYaMostrados.has(a.user_id)
        );
      }

      // Recien llegados (últimos 30 días)
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - 30);
      const recienLlegados = withReviews.filter(a => {
        if (!a.createdAt) return false;
        return new Date(a.createdAt) >= fechaLimite;
      });

      return {
        populares: discovery.populares,
        destacados: discovery.destacados,
        enCiudad,
        recienLlegados,
        resto: discovery.resto,
        pagination: discovery.pagination,
      };
    }

    // For artists, load profiles and filter by artist-specific fields
    if (role === 'Artista') {

      // Obtener todos los user_id de los artistas
      const artistIds = users.map(u => u.user_id);
      // Traer todos los días bloqueados de todos los artistas en una sola consulta
      const allBlockedDays = artistIds.length > 0 ? await this.blockedDaysRepository.find({
        where: {
          artist: { user_id: In(artistIds) },
        },
      }) : [];
      // Mapear por artist_id
      const blockedDaysMap: Record<number, string[]> = {};
      allBlockedDays.forEach(bd => {
        const id = bd.artist.user_id;
        if (!blockedDaysMap[id]) blockedDaysMap[id] = [];
        let dateStr: string;
        if (bd.blockedDate instanceof Date) {
          dateStr = bd.blockedDate.toISOString().slice(0, 10);
        } else {
          dateStr = String(bd.blockedDate).slice(0, 10);
        }
        blockedDaysMap[id].push(dateStr);
      });

      // Calcular bookings aceptados por artista solo si hay artistIds
      let bookingsPorArtistaRaw: any[] = [];
      if (artistIds.length > 0) {
        bookingsPorArtistaRaw = await this.requestsRepository
          .createQueryBuilder('request')
          .select('request.artist_id', 'artistId')
          .addSelect('COUNT(*)', 'total')
          .where('request.status = :status', { status: 'Accepted' })
          .andWhere('request.artist_id IN (:...artistIds)', { artistIds })
          .groupBy('request.artist_id')
          .getRawMany();
      }
      const bookingsPorArtista: Record<number, number> = {};
      bookingsPorArtistaRaw.forEach(row => {
        bookingsPorArtista[Number(row.artistId)] = Number(row.total);
      });

      const usersWithProfiles = await Promise.all(
        users.map(async (user) => {
          const profile = await this.artistProfileRepository.findOne({
            where: { user_id: user.user_id },
          });
          return {
            ...user,
            ...profile,
            managerId: profile?.managerId,
            blockedDays: blockedDaysMap[user.user_id] || [],
            totalBookings: bookingsPorArtista[user.user_id] || 0,
          };
        })
      );

      // Filtros existentes
      let filtered = usersWithProfiles;
      // Log para depuración: ver valor recibido y fechas bloqueadas
      if (filters.date) {
        const dateStr = filters.date;
        filtered = filtered.filter(u => {
          const tieneBloqueado = u.blockedDays && u.blockedDays.includes(dateStr);
          return !tieneBloqueado;
        });
      }
      if (filters.priceMin !== undefined) {
        filtered = filtered.filter(
          u => (u.basePrice || 0) >= filters.priceMin!
        );
      }
      if (filters.priceMax !== undefined) {
          // Log de artistas después de filtrar por nombre/nickname
        filtered = filtered.filter(
          u => (u.basePrice || 0) <= filters.priceMax!
        );
      }
      if (filters.genre && filters.genre.length > 0) {
        filtered = filtered.filter(u => {
          if (!u.genre || !Array.isArray(u.genre)) return false;
          return filters.genre!.some(g => 
            (u.genre as string[]).some((ug: string) => ug.toLowerCase().includes(g.toLowerCase()))
          );
        });
      }
      if (filters.verified !== undefined) {
        filtered = filtered.filter(u => u.verified === filters.verified);
      }
      // Eliminado filtro redundante por query (ya se filtra en SQL)
      // Log para ver el objeto completo de los artistas filtrados

      // Simular reviewsCount si no existe (para pruebas y paginación)
      const withReviews = filtered.map((u, idx) => ({
        ...u,
        reviewsCount: ('reviewsCount' in u && (u as any).reviewsCount !== undefined ? (u as any).reviewsCount : Math.floor(Math.random() * 100))
      }));

      // Log para depuración: ver qué artistas llegan a discoveryBlocks

      // Usar función genérica discoveryBlocks con page y pageSize originales
            // Calcular fecha límite para 'recién llegados' (últimos 30 días)
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - 30);
            const recienLlegados = withReviews.filter(a => {
              if (!a.createdAt) return false;
              return new Date(a.createdAt) >= fechaLimite;
            });
      const page = (filters as any).page ? Number((filters as any).page) : 1;
      const pageSize = (filters as any).pageSize ? Number((filters as any).pageSize) : 20;
      const discovery = discoveryBlocks(withReviews, {
        reviewsCountKey: 'reviewsCount',
        createdAtKey: 'createdAt',
        idKey: 'user_id',
        page,
        pageSize,
      });

      // Obtener la ciudad del usuario desde los filtros
      const ciudadUsuario = filters.city ? filters.city.toLowerCase() : null;
      // Unir todos los artistas de la respuesta (populares, destacados, resto)
      let enCiudad: typeof withReviews = [];
      if (ciudadUsuario) {
        const idsYaMostrados = new Set([
          ...discovery.populares.map(a => a.user_id),
          ...discovery.destacados.map(a => a.user_id)
        ]);
        enCiudad = withReviews.filter(
          a => a.city && a.city.toLowerCase() === ciudadUsuario && !idsYaMostrados.has(a.user_id)
        );
      }

      return {
        populares: discovery.populares,
        destacados: discovery.destacados,
        recienLlegados,
        enCiudad,
        resto: discovery.resto,
        masContratados: [...withReviews]
          .sort((a, b) => (b.totalBookings || 0) - (a.totalBookings || 0))
          .slice(0, 10),
        pagination: discovery.pagination,
      };
    }

    // For other roles, just load profiles
    const usersWithProfiles = await Promise.all(
      users.map(user => this.loadUserProfile(user))
    );

    return usersWithProfiles;
  }
  async findArtistsByManager(managerId: number) {
    // Busca todos los perfiles de artista cuyo managerId coincida
    const artistProfiles = await this.artistProfileRepository.find({
      where: { managerId },
      relations: ['user'],
    });
    // Devuelve los datos de usuario de cada artista
    return artistProfiles.map(profile => profile.user);
  }
}
