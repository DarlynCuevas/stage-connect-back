/**
 * Migration para crear la tabla 'requests' en PostgreSQL
 * Ejecutar: npm run typeorm migration:generate
 * 
 * NOTA: Con synchronize: true en el app.module.ts, la tabla se crea automáticamente.
 * Este archivo es de referencia para entender la estructura generada.
 */

import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateRequestsTable1702000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear ENUM para RequestStatus
    await queryRunner.query(`
      CREATE TYPE request_status_enum AS ENUM ('Pending', 'Accepted', 'Rejected')
    `);

    // Crear tabla requests
    await queryRunner.createTable(
      new Table({
        name: 'requests',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'artist_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'requester_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'eventDate',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'eventLocation',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'eventType',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'offeredPrice',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'request_status_enum',
            default: `'Pending'`,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
    );

    // Agregar Foreign Key para artist
    await queryRunner.createForeignKey(
      'requests',
      new TableForeignKey({
        columnNames: ['artist_id'],
        referencedColumnNames: ['user_id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Agregar Foreign Key para requester
    await queryRunner.createForeignKey(
      'requests',
      new TableForeignKey({
        columnNames: ['requester_id'],
        referencedColumnNames: ['user_id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar Foreign Keys
    const table = await queryRunner.getTable('requests');
    
    if (table) {
      const foreignKeys = table.foreignKeys;

      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('requests', fk);
      }
    }

    // Eliminar tabla
    await queryRunner.dropTable('requests');

    // Eliminar ENUM
    await queryRunner.query(`DROP TYPE request_status_enum`);
  }
}
