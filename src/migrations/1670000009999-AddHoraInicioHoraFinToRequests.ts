import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHoraInicioHoraFinToRequests1670000009999 implements MigrationInterface {
    name = 'AddHoraInicioHoraFinToRequests1670000009999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requests" ADD "horaInicio" varchar(5)`);
        await queryRunner.query(`ALTER TABLE "requests" ADD "horaFin" varchar(5)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requests" DROP COLUMN "horaFin"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP COLUMN "horaInicio"`);
    }
}
