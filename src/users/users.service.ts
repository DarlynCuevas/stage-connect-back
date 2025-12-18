// Archivo: src/users/users.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { User, UserRole } from './user.entity';
import { ArtistProfile } from './artist-profile.entity';
import { ManagerProfile } from './manager-profile.entity';
import { VenueProfile } from './venue-profile.entity';
import { PromoterProfile } from './promoter-profile.entity';
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
    console.log('🔍 [UsersService.findById] Searching for user with ID:', id);
    
    const user = await this.usersRepository.findOne({ where: { user_id: id } });
    
    if (!user) {
      console.log('❌ [UsersService.findById] User not found with ID:', id);
      return null;
    }

    console.log('✅ [UsersService.findById] User found:', { id: user.user_id, role: user.role, name: user.name });

    // Load corresponding profile based on role
    const userWithProfile = await this.loadUserProfile(user);
    console.log('📊 [UsersService.findById] User with profile loaded:', !!userWithProfile);
    return userWithProfile;
  }

  // Helper method to load user profile based on role
  private async loadUserProfile(user: User): Promise<any> {
    let profile: any = null;

    switch (user.role) {
      case 'Artista':
        profile = await this.artistProfileRepository.findOne({
          where: { user_id: user.user_id },
        });
        if (profile) {
          return { ...user, ...profile, managerId: profile.managerId };
        }
        // Si no existe el perfil, crearlo automáticamente
        const newArtistProfile = this.artistProfileRepository.create({
          user_id: user.user_id,
        });
        const savedArtistProfile = await this.artistProfileRepository.save(newArtistProfile);
        return { ...user, ...savedArtistProfile, managerId: savedArtistProfile.managerId };
      case 'Manager':
        profile = await this.managerProfileRepository.findOne({
          where: { user_id: user.user_id },
        });
        if (profile) {
          console.log('✅ [loadUserProfile] Manager profile found for user:', user.user_id);
          return { ...user, ...profile };
        }
        // Si no existe el perfil, crearlo automáticamente
        console.log('⚠️ [loadUserProfile] Manager profile not found, creating new one for user:', user.user_id);
        const newManagerProfile = this.managerProfileRepository.create({
          user_id: user.user_id,
        });
        const savedManagerProfile = await this.managerProfileRepository.save(newManagerProfile);
        console.log('✅ [loadUserProfile] Manager profile created for user:', user.user_id);
        return { ...user, ...savedManagerProfile };
      case 'Local':
        profile = await this.venueProfileRepository.findOne({
          where: { user_id: user.user_id },
        });
        if (profile) {
          return { ...user, ...profile };
        }
        // Si no existe el perfil, crearlo automáticamente
        const newVenueProfile = this.venueProfileRepository.create({
          user_id: user.user_id,
        });
        const savedVenueProfile = await this.venueProfileRepository.save(newVenueProfile);
        return { ...user, ...savedVenueProfile };
      case 'Promotor':
        profile = await this.promoterProfileRepository.findOne({
          where: { user_id: user.user_id },
        });
        if (profile) {
          return { ...user, ...profile };
        }
        // Si no existe el perfil, crearlo automáticamente
        const newPromoterProfile = this.promoterProfileRepository.create({
          user_id: user.user_id,
        });
        const savedPromoterProfile = await this.promoterProfileRepository.save(newPromoterProfile);
        return { ...user, ...savedPromoterProfile };
      default:
        return user;
    }
  }

  // Actualizar perfil de usuario
  async updateProfile(userId: number, updateData: Partial<User>): Promise<any> {
    console.log('📝 [updateProfile] UserId:', userId);
    console.log('📝 [updateProfile] UpdateData:', JSON.stringify(updateData, null, 2));
    
    const user = await this.usersRepository.findOne({ where: { user_id: userId } });
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    console.log('👤 [updateProfile] User found:', user.user_id, user.role);
    
    // Separate common fields from role-specific fields
    const commonFields = ['name', 'bio', 'country', 'city', 'avatar', 'banner', 'gender'];
    const userUpdates: any = {};
    const profileUpdates: any = {};

    // Separate updates
    Object.keys(updateData).forEach(key => {
      if (commonFields.includes(key)) {
        userUpdates[key] = updateData[key];
      } else {
        profileUpdates[key] = updateData[key];
      }
    });

    console.log('🔵 [updateProfile] User updates:', userUpdates);
    console.log('🟢 [updateProfile] Profile updates:', profileUpdates);

    // Update user table
    if (Object.keys(userUpdates).length > 0) {
      Object.assign(user, userUpdates);
      await this.usersRepository.save(user);
      console.log('✅ [updateProfile] User table updated');
    }

    // Update corresponding profile
    if (Object.keys(profileUpdates).length > 0) {
      console.log('🔄 [updateProfile] Updating profile for role:', user.role);
      switch (user.role) {
        case 'Artista':
          const artistProfile = await this.artistProfileRepository.findOne({
            where: { user_id: userId },
          });
          console.log('🎨 [updateProfile] Artist profile found:', artistProfile ? 'YES' : 'NO');
          if (artistProfile) {
            Object.assign(artistProfile, profileUpdates);
            await this.artistProfileRepository.save(artistProfile);
            console.log('✅ [updateProfile] Artist profile updated');
          } else {
            console.log('⚠️ [updateProfile] Artist profile NOT FOUND, creating...');
            const newProfile = this.artistProfileRepository.create({
              user_id: userId,
              ...profileUpdates,
            });
            await this.artistProfileRepository.save(newProfile);
            console.log('✅ [updateProfile] Artist profile created');
          }
          break;
        case 'Manager':
          const managerProfile = await this.managerProfileRepository.findOne({
            where: { user_id: userId },
          });
          console.log('💼 [updateProfile] Manager profile found:', managerProfile ? 'YES' : 'NO');
          if (managerProfile) {
            Object.assign(managerProfile, profileUpdates);
            await this.managerProfileRepository.save(managerProfile);
            console.log('✅ [updateProfile] Manager profile updated');
          } else {
            console.log('⚠️ [updateProfile] Manager profile NOT FOUND, creating...');
            const newProfile = this.managerProfileRepository.create({
              user_id: userId,
              ...profileUpdates,
            });
            await this.managerProfileRepository.save(newProfile);
            console.log('✅ [updateProfile] Manager profile created');
          }
          break;
        case 'Local':
          const venueProfile = await this.venueProfileRepository.findOne({
            where: { user_id: userId },
          });
          console.log('🏢 [updateProfile] Venue profile found:', venueProfile ? 'YES' : 'NO');
          if (venueProfile) {
            Object.assign(venueProfile, profileUpdates);
            await this.venueProfileRepository.save(venueProfile);
            console.log('✅ [updateProfile] Venue profile updated');
          } else {
            console.log('⚠️ [updateProfile] Venue profile NOT FOUND, creating...');
            const newProfile = this.venueProfileRepository.create({
              user_id: userId,
              ...profileUpdates,
            });
            await this.venueProfileRepository.save(newProfile);
            console.log('✅ [updateProfile] Venue profile created');
          }
          break;
        case 'Promotor':
          const promoterProfile = await this.promoterProfileRepository.findOne({
            where: { user_id: userId },
          });
          console.log('📢 [updateProfile] Promoter profile found:', promoterProfile ? 'YES' : 'NO');
          if (promoterProfile) {
            Object.assign(promoterProfile, profileUpdates);
            await this.promoterProfileRepository.save(promoterProfile);
            console.log('✅ [updateProfile] Promoter profile updated');
          } else {
            console.log('⚠️ [updateProfile] Promoter profile NOT FOUND, creating...');
            const newProfile = this.promoterProfileRepository.create({
              user_id: userId,
              ...profileUpdates,
            });
            await this.promoterProfileRepository.save(newProfile);
            console.log('✅ [updateProfile] Promoter profile created');
          }
          break;
      }
    }

    // Return updated user with profile
    const result = await this.findById(userId);
    console.log('🎯 [updateProfile] Final result:', result ? 'SUCCESS' : 'FAILED');
    return result;
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
    },
  ): Promise<any[]> {
    // Base query for users
    const qb = this.usersRepository.createQueryBuilder('user');
    qb.where('user.role = :role', { role });

    if (filters.query) {
      // Buscar por cada palabra del query (AND lógico, todos los parámetros aplicados correctamente)
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
          // Solo una palabra o fragmento: buscar tal cual
          params['q'] = `%${words[0]}%`;
          if (role === 'Local') {
            qb.andWhere(`(unaccent(LOWER(user.name)) ILIKE unaccent(:q) OR unaccent(LOWER(user.email)) ILIKE unaccent(:q))`, params);
          } else if (role === 'Artista') {
            qb.andWhere(`(
              unaccent(LOWER(user.name)) ILIKE unaccent(:q)
              OR unaccent(LOWER(user.email)) ILIKE unaccent(:q)
              OR unaccent(LOWER(user.city)) ILIKE unaccent(:q)
            )`, params);
          } else {
            qb.andWhere(`(unaccent(LOWER(user.name)) ILIKE unaccent(:q) OR unaccent(LOWER(user.email)) ILIKE unaccent(:q))`, params);
          }
        } else {
          // Varias palabras: buscar cada una como OR
          const orConditions: string[] = [];
          words.forEach((word, idx) => {
            const param = `q${idx}`;
            params[param] = `%${word}%`;
            if (role === 'Local') {
              orConditions.push(`(unaccent(LOWER(user.name)) ILIKE unaccent(:${param}) OR unaccent(LOWER(user.email)) ILIKE unaccent(:${param}))`);
            } else if (role === 'Artista') {
              orConditions.push(`(
                unaccent(LOWER(user.name)) ILIKE unaccent(:${param})
                OR unaccent(LOWER(user.email)) ILIKE unaccent(:${param})
                OR unaccent(LOWER(user.city)) ILIKE unaccent(:${param})
              )`);
            } else {
              orConditions.push(`(unaccent(LOWER(user.name)) ILIKE unaccent(:${param}) OR unaccent(LOWER(user.email)) ILIKE unaccent(:${param}))`);
            }
          });
          qb.andWhere(orConditions.join(' OR '), params);
        }
      }
    }

    if (filters.country) {
      qb.andWhere('user.country = :country', { country: filters.country });
    }

    if (filters.city) {
      qb.andWhere('user.city = :city', { city: filters.city });
    }

    qb.orderBy('user.created_at', 'DESC');

    const users = await qb.getMany();


    // Para managers, cargar perfil y filtrar por featured, verified y favorite si corresponde
    if (role === 'Manager') {
      const usersWithProfiles = await Promise.all(
        users.map(async (user) => {
          const profile = await this.managerProfileRepository.findOne({ where: { user_id: user.user_id } });
          return {
            ...user,
            ...profile,
          };
        })
      );
      // No se filtra por featured, verified ni favorite porque no existen en el perfil de manager
      return usersWithProfiles;
    }

    // For artists, load profiles and filter by artist-specific fields
    if (role === 'Artista') {
      // Obtener todos los user_id de los artistas
      const artistIds = users.map(u => u.user_id);
      // Traer todos los días bloqueados de todos los artistas en una sola consulta
      const allBlockedDays = await this.blockedDaysRepository.find({
        where: {
          artist: { user_id: In(artistIds) },
        },
      });
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

      const usersWithProfiles = await Promise.all(
        users.map(async (user) => {
          const profile = await this.artistProfileRepository.findOne({
            where: { user_id: user.user_id },
          });
          return { ...user, ...profile, managerId: profile?.managerId, blockedDays: blockedDaysMap[user.user_id] || [] };
        })
      );

      // Filter by artist-specific fields
      let filtered = usersWithProfiles;

      if (filters.priceMin !== undefined) {
        filtered = filtered.filter(
          u => (u.basePrice || 0) >= filters.priceMin!
        );
      }

      if (filters.priceMax !== undefined) {
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

      if (filters.featured !== undefined) {
        filtered = filtered.filter(u => u.featured === filters.featured);
      }

      if (filters.verified !== undefined) {
        filtered = filtered.filter(u => u.verified === filters.verified);
      }

      // Si hay query, filtrar también por nickName y bio en el perfil
      if (filters.query && filters.query.trim() !== '') {
        const q = filters.query.trim().toLowerCase();
        filtered = filtered.filter(u =>
          (u.nickName && u.nickName.toLowerCase().includes(q))
          || (u.bio && u.bio.toLowerCase().includes(q))
          || (u.city && u.city.toLowerCase().includes(q))
        );
      }

      return filtered;
    }

    // For other roles, just load profiles
    const usersWithProfiles = await Promise.all(
      users.map(user => this.loadUserProfile(user))
    );

    return usersWithProfiles;
  }
}
