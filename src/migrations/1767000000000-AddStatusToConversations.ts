import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusToConversations1767000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "conversations" ADD COLUMN "status" varchar NOT NULL DEFAULT 'pending'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "conversations" DROP COLUMN "status"`
    );
  }
}
