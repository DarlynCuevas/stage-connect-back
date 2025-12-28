import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableUnique } from "typeorm";

export class CreateFollowersTable1714500000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "followers",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "followerUserId",
                        type: "int",
                        isNullable: false,
                    },
                    {
                        name: "followedUserId",
                        type: "int",
                        isNullable: false,
                    },
                ],
            })
        );
        await queryRunner.createForeignKey(
            "followers",
            new TableForeignKey({
                columnNames: ["followerUserId"],
                referencedColumnNames: ["user_id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            })
        );
        await queryRunner.createForeignKey(
            "followers",
            new TableForeignKey({
                columnNames: ["followedUserId"],
                referencedColumnNames: ["user_id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            })
        );
        await queryRunner.createUniqueConstraint(
            "followers",
            new TableUnique({
                name: "UQ_follower_followed",
                columnNames: ["followerUserId", "followedUserId"],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("followers");
    }
}
