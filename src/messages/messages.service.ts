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

  async getUserConversations(userId: number) {
    return this.conversationRepo
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participant')
      .leftJoinAndSelect('conversation.messages', 'messages')
      .where('participant.user_id = :userId', { userId })
      .orderBy('conversation.updatedAt', 'DESC')
      .getMany();
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
