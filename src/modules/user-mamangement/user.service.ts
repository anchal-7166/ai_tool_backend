import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './user.repository';
import { UpdateUserDto } from './dto/update.dto';
import { ChangePasswordDto } from './dto/change-password';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly config: ConfigService,
  ) {}


  async getProfile(userId: string) {
    const user = await this.usersRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return this.sanitizeUser(user);
  }

  async getByUsername(username: string) {
    const user = await this.usersRepo.findOne({ username, isActive: true });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitizeUser(user);
  }


  async updateProfile(userId: string, dto: UpdateUserDto) {
    // Check username not taken by someone else
    if (dto.username) {
      const existing = await this.usersRepo.findOne({ username: dto.username });
      if (existing && existing.id !== userId) {
        throw new ConflictException('Username already taken');
      }
    }

    const updated = await this.usersRepo.update(userId, dto);
    return this.sanitizeUser(updated);
  }


  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Verify current password
    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash and save new password
    const hashed = await bcrypt.hash(
      dto.newPassword,
       this.config.get<number>('app.security.bcryptRounds') ?? 12,
    );

    await this.usersRepo.update(userId, { password: hashed });

    return { message: 'Password changed successfully' };
  }

  // ==================== DEACTIVATE ACCOUNT ====================

  async deactivateAccount(userId: string) {
    await this.usersRepo.deactivate(userId);
    return { message: 'Account deactivated successfully' };
  }

  // ==================== ADMIN OPERATIONS ====================

  async getAllUsers(page: number = 1, limit: number = 20) {
    return this.usersRepo.findAll({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserById(id: string) {
    const user = await this.usersRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.sanitizeUser(user);
  }

  async changeUserRole(userId: string, role: UserRole) {
    const user = await this.usersRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.usersRepo.update(userId, { role });
    return this.sanitizeUser(updated);
  }

  sanitizeUser(user: User) {
    const { password, ...safe } = user;
    return safe;
  }
}