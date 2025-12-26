import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';
import { User } from '../users/user.entity';
import { MessagesGateway } from './messages.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message, User])],
  providers: [MessagesService, MessagesGateway],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}
