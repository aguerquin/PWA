import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export class AuthProvider {
  static async generateHash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  static async comparePassword(password: string, user: User): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  static async compare(data: string, encrypted: string): Promise<boolean> {
    return await bcrypt.compare(data, encrypted);
  }
}
