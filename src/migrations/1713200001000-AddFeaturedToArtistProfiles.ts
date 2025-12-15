import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFeaturedToArtistProfiles1713200001000 implements MigrationInterface {
    name = 'AddFeaturedToArtistProfiles1713200001000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`ALTER TABLE "artist_profiles" ADD "featured" boolean NOT NULL DEFAULT false`); // Comentado: la columna ya existe
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "artist_profiles" DROP COLUMN "featured"`);
    }
}
