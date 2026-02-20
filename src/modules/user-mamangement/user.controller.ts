import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { UpdateUserDto } from './dto/update.dto';
import { ChangePasswordDto } from './dto/change-password';
import { RolesGuard } from '../auth/role-guard';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/role-decorator';
import { JwtAuthGuard } from '../auth/jwtguard';


@Controller('users')
@UseGuards(JwtAuthGuard)   // All users routes require auth
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users/me
  @Get('me')
  async getMe(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  // PATCH /users/me
  @Patch('me')
  async updateMe(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  // PATCH /users/me/password
  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, dto);
  }

  // DELETE /users/me
  @Delete('me')
  @HttpCode(HttpStatus.OK)
  async deactivateMyAccount(@CurrentUser('id') userId: string) {
    return this.usersService.deactivateAccount(userId);
  }


  @Get(':username')
  async getByUsername(@Param('username') username: string) {
    return this.usersService.getByUsername(username);
  }


  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.usersService.getAllUsers(page, limit);
  }

  @Get('admin/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async changeRole(
    @Param('id') id: string,
    @Body('role') role: UserRole,
  ) {
    return this.usersService.changeUserRole(id, role);
  }


}