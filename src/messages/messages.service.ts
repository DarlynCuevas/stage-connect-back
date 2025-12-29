import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';
import { User } from '../users/user.entity';
import { MessagesGateway } from './messages.gateway';

import { sanitizeMessageContent } from './sanitize-message';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @Inject(MessagesGateway)
    private readonly messagesGateway: MessagesGateway,
  ) {}

  async acceptConversation(conversationId: number, userId: number) {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });
    if (!conversation) throw new NotFoundException('Conversación no encontrada');
    // Solo un participante con rol Local puede aceptar (o ambos, pero aquí solo validamos que sea participante)
    if (!conversation.participants.some(u => u.user_id === userId)) {
      throw new ForbiddenException('No tienes acceso a esta conversación');
    }
    conversation.status = 'accepted';
    await this.conversationRepo.save(conversation);
    return { success: true, status: conversation.status };
  }

  async getUserConversations(userId: number) {
    const conversations = await this.conversationRepo
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participant')
      .leftJoinAndSelect('conversation.messages', 'messages')
      .where('participant.user_id = :userId', { userId })
      .orderBy('conversation.updatedAt', 'DESC')
      .getMany();

    // Recargar participantes si solo hay uno
    for (const conv of conversations) {
      if (conv.participants.length < 2) {
        const fullConv = await this.conversationRepo.findOne({
          where: { id: conv.id },
          relations: ['participants'],
        });
        conv.participants = fullConv?.participants ?? conv.participants;
      }
    }

    // Sanitizar y añadir nickName si es artista
    const { sanitizeUserResponse } = require('../users/users.service');
    const { ArtistProfile } = require('../users/artist-profile.entity');
    const artistProfileRepo = this.userRepo.manager.getRepository(ArtistProfile);

    async function enrichParticipant(participant: any) {
      const sanitized = sanitizeUserResponse(participant);
      if (sanitized.role === 'Artista') {
        const profile = await artistProfileRepo.findOne({ where: { user_id: sanitized.user_id } });
        if (profile && profile.nickName) {
          sanitized.nickName = profile.nickName;
        }
      }
      return sanitized;
    }

    // Añadir lastMessage a cada conversación
    const result = await Promise.all(conversations.map(async conversation => {
      // Enriquecer participantes
      const enrichedParticipants = await Promise.all(
        (conversation.participants ?? []).map((p: any) => enrichParticipant(p))
      );
      // Buscar el último mensaje (por createdAt)
      let lastMessage: Message | null = null;
      if (Array.isArray(conversation.messages) && conversation.messages.length > 0) {
        lastMessage = conversation.messages.reduce((prev, curr) => {
          return new Date(curr.createdAt) > new Date(prev.createdAt) ? curr : prev;
        }, conversation.messages[0]);
      }
      return {
        ...conversation,
        status: conversation.status,
        participants: enrichedParticipants,
        lastMessage: lastMessage as Message | null,
      };
    }));
    return result;
  }

  async getMessages(conversationId: number, userId: number) {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });
    if (!conversation) throw new NotFoundException('Conversación no encontrada');
    if (!conversation.participants.some(u => u.user_id === userId)) {
      throw new ForbiddenException('No tienes acceso a esta conversación');
    }
    return this.messageRepo.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  async sendMessage(conversationId: number, senderId: number, content: string) {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });
    if (!conversation) throw new NotFoundException('Conversación no encontrada');
    if (!conversation.participants.some(u => u.user_id === senderId)) {
      throw new ForbiddenException('No puedes enviar mensajes en esta conversación');
    }
    // Suponemos conversación de 2 participantes
    const receiver = conversation.participants.find(u => u.user_id !== senderId);
    if (!receiver) throw new NotFoundException('Receptor no encontrado');
    const sanitizedContent = sanitizeMessageContent(content);
    const message = this.messageRepo.create({
      conversationId,
      senderId,
      receiverId: receiver.user_id,
      content: sanitizedContent,
    });
    await this.messageRepo.save(message);
    // Actualizar updatedAt de la conversación
    await this.conversationRepo.update(conversationId, { updatedAt: new Date() });
    this.messagesGateway.emitNewMessage(conversationId, message);
    return message;
  }

  async findOrCreateConversation(userA: number, userB: number) {
    // Buscar conversación existente entre ambos usuarios
    let conversation = await this.conversationRepo
      .createQueryBuilder('c')
      .leftJoin('c.participants', 'p')
      .where('p.user_id IN (:...ids)', { ids: [userA, userB] })
      .groupBy('c.id')
      .having('COUNT(DISTINCT p.user_id) = 2')
      .getOne();
    if (!conversation) {
      const users = await this.userRepo.find({ where: { user_id: In([userA, userB]) } });
      conversation = this.conversationRepo.create({ participants: users });
      await this.conversationRepo.save(conversation);
    }
    return conversation;
  }
}
