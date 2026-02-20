import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { BaseRepository } from '../base-repository/base-repository';
import { User } from '@prisma/client';


@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(prisma: PrismaService) {
    super(prisma, 'user');
  }

  // User-specific: stamp last login time
  async updateLastLogin(id: string): Promise<User> {
    return this.update(id, { lastLoginAt: new Date() });
  }

  // User-specific: find by email (common lookup)
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email });
  }

  // User-specific: find by username (common lookup)
  async findByUsername(username: string): Promise<User | null> {
    return this.findOne({ username });
  }

  // User-specific: deactivate account (soft delete)
  async deactivate(id: string): Promise<User> {
    return this.update(id, { isActive: false });
  }

  // User-specific: activate account
  async activate(id: string): Promise<User> {
    return this.update(id, { isActive: true });
  }

  // User-specific: mark email as verified
  async markVerified(id: string): Promise<User> {
    return this.update(id, { isVerified: true });
  }
}