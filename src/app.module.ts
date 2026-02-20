import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/user-mamangement/user.module';
import { SubmissionsModule } from './modules/submissions/submission.module';
import { ToolsModule } from './modules/tool-list/tool-list.module';
import { FiltersModule } from './modules/filters/filter.module';


@Module({
  imports: [
     ConfigModule.forRoot({
      isGlobal: true,              
      envFilePath: '.env',
      load: [appConfig, databaseConfig],
    }), 
    AuthModule,
    UsersModule,
    SubmissionsModule,
    ToolsModule,
    FiltersModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
