import { Module } from '@nestjs/common';
import { EnumsService } from './enum.service';
import { EnumsController } from './enum.controller';


@Module({
  controllers: [EnumsController],
  providers: [EnumsService],
  exports: [EnumsService]
})
export class EnumsModule {}