import { DataSource } from 'typeorm';
import AppDataSource from '../src/data-source';

async function clearDatabase() {
  const dataSource: DataSource = await AppDataSource.initialize();
  try {
    // Obtener todas las tablas de usuario (excluyendo migraciones y system)
    const tables: { tablename: string }[] = await dataSource.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE 'migrations%';
    `);
    if (!tables.length) {
      console.log('No se encontraron tablas para vaciar.');
      return;
    }
    const tableNames = tables.map(t => `"${t.tablename}"`).join(', ');
    await dataSource.query('SET session_replication_role = replica;');
    await dataSource.query(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`);
    await dataSource.query('SET session_replication_role = DEFAULT;');
    console.log('¡Todas las tablas han sido vaciadas correctamente!');
  } catch (error) {
    console.error('Error al vaciar las tablas:', error);
  } finally {
    await dataSource.destroy();
  }
}

clearDatabase();
