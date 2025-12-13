import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFeaturedVerifiedToVenueProfiles1700000000000 implements MigrationInterface {
    name = 'AddFeaturedVerifiedToVenueProfiles1700000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "venue_profiles" ADD "featured" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "venue_profiles" ADD "verified" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "venue_profiles" DROP COLUMN "verified"`);
        await queryRunner.query(`ALTER TABLE "venue_profiles" DROP COLUMN "featured"`);
    }
}
