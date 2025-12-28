// Utility to sanitize an array of users
import { sanitizeUserResponse } from '../users/users.service';

export function sanitizeUsersArray(users: any[]): any[] {
  return users.map(sanitizeUserResponse);
}
