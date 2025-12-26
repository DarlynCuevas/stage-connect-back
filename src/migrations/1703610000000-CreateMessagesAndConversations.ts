import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMessagesAndConversations1703610000000 implements MigrationInterface {
    name = 'CreateMessagesAndConversations1703610000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "conversations" (
                "id" SERIAL PRIMARY KEY,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            );
        `);
        await queryRunner.query(`
            CREATE TABLE "conversation_participants" (
                "conversationId" integer NOT NULL,
                "userId" integer NOT NULL,
                CONSTRAINT "PK_conversation_participants" PRIMARY KEY ("conversationId", "userId"),
                CONSTRAINT "FK_conversation_participants_conversation" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_conversation_participants_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
            );
        `);
        await queryRunner.query(`
            CREATE TABLE "messages" (
                "id" SERIAL PRIMARY KEY,
                "conversationId" integer NOT NULL,
                "senderId" integer NOT NULL,
                "receiverId" integer NOT NULL,
                "content" text NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "read" boolean NOT NULL DEFAULT false,
                CONSTRAINT "FK_messages_conversation" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_messages_sender" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_messages_receiver" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TABLE "conversation_participants"`);
        await queryRunner.query(`DROP TABLE "conversations"`);
    }
}
