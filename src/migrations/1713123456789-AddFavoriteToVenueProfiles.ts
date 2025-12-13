import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFavoriteToVenueProfiles1713123456789 implements MigrationInterface {
    name = 'AddFavoriteToVenueProfiles1713123456789'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "venue_profiles" ADD "favorite" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "venue_profiles" DROP COLUMN "favorite"`);
    }
}
