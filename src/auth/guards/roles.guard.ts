// Archivo: src/auth/guards/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/users/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Obtener los roles requeridos de la ruta (@Roles('Local', 'Promotor'))
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(), // De la función del controlador
      context.getClass(),  // De la clase del controlador
    ]);

    // Si no se especifica ningún rol, permitimos el acceso
    if (!requiredRoles) {
      return true;
    }

    // 2. Obtener la información del usuario del token
    // El JwtAuthGuard ya puso el usuario decodificado en req.user
    const { user } = context.switchToHttp().getRequest();

    // 3. Comprobar si el rol del usuario está en la lista de roles requeridos
    return requiredRoles.some((role) => user.role === role);
  }
}