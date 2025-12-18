import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUserFavoritesTable1702920000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "user_favorites",
        columns: [
          {
            name: "user_id",
            type: "int",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "favorite_user_id",
            type: "int",
            isPrimary: true,
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ["user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["user_id"],
            onDelete: "CASCADE",
          },
          {
            columnNames: ["favorite_user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["user_id"],
            onDelete: "CASCADE",
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("user_favorites");
  }
}
