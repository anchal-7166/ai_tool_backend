import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/database/prisma.module';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { UsersRepository } from './user.repository';



@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersRepository, UsersService], 
})
export class UsersModule {}