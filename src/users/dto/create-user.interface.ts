import { UserRole } from '../user.entity';

export interface CreateUserInterface {
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
}