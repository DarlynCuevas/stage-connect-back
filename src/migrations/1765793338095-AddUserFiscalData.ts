import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserFiscalData1765793338095 implements MigrationInterface {
    name = 'AddUserFiscalData1765793338095'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_fiscal_data" ("id" SERIAL NOT NULL, "dni_nif" character varying(32) NOT NULL, "razon_social" character varying(128), "direccion" character varying(255) NOT NULL, "ciudad" character varying(64) NOT NULL, "provincia" character varying(64) NOT NULL, "codigo_postal" character varying(16) NOT NULL, "pais" character varying(64) NOT NULL, "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(), "fecha_actualizacion" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, CONSTRAINT "PK_1bc4c55d4b0983b2b4d5ff7779b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_fiscal_data" ADD CONSTRAINT "FK_791c0702bc20379daa861a5d243" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_fiscal_data" DROP CONSTRAINT "FK_791c0702bc20379daa861a5d243"`);
        await queryRunner.query(`DROP TABLE "user_fiscal_data"`);
    }

}
