import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFeaturedToManagerProfile1679999999999 implements MigrationInterface {
    name = 'AddFeaturedToManagerProfile1679999999999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "manager_profiles" ADD "featured" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "manager_profiles" DROP COLUMN "featured"`);
    }
}
