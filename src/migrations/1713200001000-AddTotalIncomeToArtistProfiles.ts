import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTotalIncomeToArtistProfiles1713200001000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "artist_profiles"
            ADD COLUMN IF NOT EXISTS "total_income_this_year" decimal(15,2) DEFAULT 0;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "artist_profiles"
            DROP COLUMN IF EXISTS "total_income_this_year";
        `);
    }
}
