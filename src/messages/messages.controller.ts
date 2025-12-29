
import { Controller, Get, Post, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  async getConversations(@Req() req: Request) {
    // @ts-ignore
    return this.messagesService.getUserConversations(req.user.user_id);
  }

  @Get('conversations/:id')
  async getMessages(@Req() req: Request, @Param('id') id: string) {
    // @ts-ignore
    return this.messagesService.getMessages(Number(id), req.user.user_id);
  }

  @Post('conversations/:id/send')
  async sendMessage(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('content') content: string,
  ) {
    // @ts-ignore
    return this.messagesService.sendMessage(Number(id), req.user.user_id, content);
  }


  // Nuevo endpoint RESTful para crear conversación con un usuario concreto
  @Post('conversations/with/:userId')
  async createConversationWith(
    @Req() req: Request,
    @Param('userId') userId: string,
  ) {
    // @ts-ignore
    return this.messagesService.findOrCreateConversation(req.user.user_id, Number(userId));
  }

  // Endpoint para aceptar solicitud de conversación
  @Post('conversations/:id/accept')
  async acceptConversation(
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    // @ts-ignore
    return this.messagesService.acceptConversation(Number(id), req.user.user_id);
  }
}
