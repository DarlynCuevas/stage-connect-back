import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContractPdfUrlToRequests1679999999999 implements MigrationInterface {
    name = 'AddContractPdfUrlToRequests1679999999999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requests" ADD "contractPdfUrl" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requests" DROP COLUMN "contractPdfUrl"`);
    }
}
