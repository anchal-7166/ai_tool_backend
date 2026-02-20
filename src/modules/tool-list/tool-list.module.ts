import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/database/prisma.module';
import { ToolsController } from './tool-list.controller';
import { ToolsService } from './tool-list.service';
import { ToolsRepository } from './tool-list.repository';


@Module({
  imports: [PrismaModule],
  controllers: [ToolsController],
  providers: [ToolsService, ToolsRepository],
  exports: [ToolsService, ToolsRepository],
})
export class ToolsModule {}