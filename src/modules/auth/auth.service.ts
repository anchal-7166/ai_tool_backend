import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersRepository } from '../user-mamangement/user.repository';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // 1. Check email already used
    const emailExists = await this.usersRepo.findOne({ email: dto.email });
    if (emailExists) {
      throw new ConflictException('Email already registered');
    }

    // 2. Check username already taken
    if (dto.username) {
      const usernameExists = await this.usersRepo.findOne({ username: dto.username });
      if (usernameExists) {
        throw new ConflictException('Username already taken');
      }
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(
      dto.password,
      this.config.get<number>('app.security.bcryptRounds') || 12,
    );

    // 4. Create user
    const user = await this.usersRepo.create({
      email: dto.email,
      password: hashedPassword,
      username: dto.username,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role:UserRole.ADMIN
    });

    // 5. Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }


  async login(dto: LoginDto) {
    // 1. Find user by email
    const user = await this.usersRepo.findOne({ email: dto.email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Check account is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    // 3. Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 4. Update last login
    await this.usersRepo.update(user.id, { lastLoginAt: new Date() });

    // 5. Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }


  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersRepo.findById(userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Access denied');
    }

    // Verify token is valid
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('app.jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokens = await this.generateTokens(user);
    return tokens;
  }


  async forgotPassword(email: string) {
    const user = await this.usersRepo.findOne({ email });

    // Always return success (don't expose if email exists)
    if (!user) {
      return { message: 'If this email exists, a reset link has been sent' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Store hashed token + expiry (1 hour)
    // Note: Add passwordResetToken & passwordResetExpiry fields to User schema if needed
    // For now storing in a simple way
    await this.usersRepo.update(user.id, {
      // passwordResetToken: resetTokenHash,
      // passwordResetExpiry: new Date(Date.now() + 3600000),
    });

    // TODO: Send email with reset link
    // resetLink = `${frontendUrl}/reset-password?token=${resetToken}`
    // await this.emailService.sendPasswordReset(user.email, resetLink)

    return { message: 'If this email exists, a reset link has been sent' };
  }

  // ==================== RESET PASSWORD ====================

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // TODO: Find user by hashed token + check expiry
    // const user = await this.usersRepo.findOne({
    //   passwordResetToken: tokenHash,
    //   passwordResetExpiry: { gt: new Date() }
    // });

    // if (!user) throw new BadRequestException('Invalid or expired token');

    const hashedPassword = await bcrypt.hash(
      newPassword,
      this.config.get<number>('app.security.bcryptRounds') || 12,
    );

    // await this.usersRepo.update(user.id, {
    //   password: hashedPassword,
    //   passwordResetToken: null,
    //   passwordResetExpiry: null,
    // });

    return { message: 'Password reset successful' };
  }

  // ==================== HELPERS ====================

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('app.jwt.secret'),
        expiresIn: this.config.get('app.jwt.accessTokenExpiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('app.jwt.refreshSecret'),
        expiresIn: this.config.get('app.jwt.refreshTokenExpiresIn'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  // Remove password from user object before returning
  sanitizeUser(user: User) {
    const { password, ...safeUser } = user;
    return safeUser;
  }
}