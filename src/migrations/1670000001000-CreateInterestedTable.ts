import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateInterestedTable1670000001000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "interested",
            columns: [
                { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
                { name: "venueId", type: "int", isNullable: false },
                { name: "managerId", type: "int", isNullable: true },
                { name: "artistId", type: "int", isNullable: false },
                { name: "date", type: "date", isNullable: false },
                { name: "price", type: "decimal", isNullable: true },
                { name: "status", type: "varchar", isNullable: false, default: "'pending'" },
                { name: "createdAt", type: "timestamp", default: "now()" },
            ],
        }), true);

        await queryRunner.createForeignKey("interested", new TableForeignKey({
            columnNames: ["venueId"],
            referencedColumnNames: ["id"],
            referencedTableName: "venue_profile",
            onDelete: "CASCADE",
        }));
        await queryRunner.createForeignKey("interested", new TableForeignKey({
            columnNames: ["managerId"],
            referencedColumnNames: ["id"],
            referencedTableName: "user",
            onDelete: "SET NULL",
        }));
        await queryRunner.createForeignKey("interested", new TableForeignKey({
            columnNames: ["artistId"],
            referencedColumnNames: ["id"],
            referencedTableName: "artist_profile",
            onDelete: "CASCADE",
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("interested");
    }
}
