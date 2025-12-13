import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClosedByToRequests1713200000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_closed_by_enum') THEN
                    CREATE TYPE "request_closed_by_enum" AS ENUM ('artist', 'manager', 'none');
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            ALTER TABLE "requests"
            ADD COLUMN IF NOT EXISTS "closed_by" "request_closed_by_enum" DEFAULT 'none';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "requests" DROP COLUMN IF EXISTS "closed_by";
        `);
        await queryRunner.query(`
            DROP TYPE IF EXISTS "request_closed_by_enum";
        `);
    }
}
