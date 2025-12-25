import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTypeToArtistAndVenueProfiles1679999999999 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE artist_profiles ADD COLUMN type varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE venue_profiles ADD COLUMN type varchar(50) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE artist_profiles DROP COLUMN type`);
        await queryRunner.query(`ALTER TABLE venue_profiles DROP COLUMN type`);
    }
}
