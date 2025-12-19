import { DataSource } from 'typeorm';
import { User } from './src/users/user.entity';
import { VenueProfile } from './src/users/venue-profile.entity';

// Configuración de la base de datos
const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '123',
  database: 'stageconnect',
  entities: [User, VenueProfile],
  synchronize: false,
});

