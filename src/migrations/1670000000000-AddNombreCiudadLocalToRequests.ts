import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNombreCiudadLocalToRequests1670000000000 implements MigrationInterface {
    name = 'AddNombreCiudadLocalToRequests1670000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requests" ADD "nombreLocal" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "requests" ADD "ciudadLocal" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requests" DROP COLUMN "ciudadLocal"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP COLUMN "nombreLocal"`);
    }
}
