import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNombreCiudadLocalToRequests1670000000000 implements MigrationInterface {
    name = 'AddNombreCiudadLocalToRequests1670000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`ALTER TABLE "requests" ADD "nombreLocal" character varying(255)`); // Comentado: la columna ya existe
        // await queryRunner.query(`ALTER TABLE "requests" ADD "ciudadLocal" character varying(255)`); // Comentado: la columna ya existe
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requests" DROP COLUMN "ciudadLocal"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP COLUMN "nombreLocal"`);
    }
}
