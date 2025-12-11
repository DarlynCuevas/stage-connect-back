// Archivo: src/auth/decorators/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/user.entity'; // Importamos los roles

export const ROLES_KEY = 'roles';

// Este decorador se usa así: @Roles('Local', 'Promotor')
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);