import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/**
 * WebSocket guard that validates JWT tokens sent in the Socket.IO handshake.
 * Accepts token in handshake.auth.token or Authorization header (Bearer ...).
 */
@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const authHeader: string | undefined = client.handshake?.headers?.authorization;
    const tokenFromHeader = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : undefined;

    const token: string | undefined = client.handshake?.auth?.token || tokenFromHeader || client.handshake?.query?.token;

    console.log(`[WsJwtGuard] Auth header:`, authHeader ? '***' : 'none');
    console.log(`[WsJwtGuard] Token from auth.token:`, client.handshake?.auth?.token ? '***' : 'none');
    console.log(`[WsJwtGuard] Token from header:`, tokenFromHeader ? '***' : 'none');
    console.log(`[WsJwtGuard] Final token:`, token ? '***' : 'MISSING');

    if (!token) {
      throw new WsException('Unauthorized: token missing');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      console.log(`[WsJwtGuard] Payload decoded:`, payload);

      // Attach user payload to the socket for later use
      client.data.user = {
        user_id: payload.user_id,
        email: payload.email,
        role: payload.role,
      };

      console.log(`[WsJwtGuard] User attached to client:`, client.data.user);

      return true;
    } catch (err) {
      console.error(`[WsJwtGuard] Token verification failed:`, err);
      throw new WsException('Unauthorized: invalid token');
    }
  }
}