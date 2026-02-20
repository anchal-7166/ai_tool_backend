import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';


export const ROLES_KEY = 'roles';

// Usage: @Roles(UserRole.ADMIN, UserRole.MODERATOR)
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);