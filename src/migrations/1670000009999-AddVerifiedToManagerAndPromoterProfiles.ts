import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVerifiedToManagerAndPromoterProfiles1670000009999 implements MigrationInterface {
    name = 'AddVerifiedToManagerAndPromoterProfiles1670000009999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "manager_profiles" ADD "verified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "promoter_profiles" ADD "verified" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "manager_profiles" DROP COLUMN "verified"`);
        await queryRunner.query(`ALTER TABLE "promoter_profiles" DROP COLUMN "verified"`);
    }
}
