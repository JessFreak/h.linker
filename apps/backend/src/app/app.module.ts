import { Module } from '@nestjs/common';
import { PrismaModule } from './modules/prisma.module';
import { UserModule } from './modules/user.module';
import { AuthModule } from './modules/auth.module';
import { ConfigModule } from '@nestjs/config';
import config from '../config/config';
import { join } from 'path';
import { CacheModule } from '@nestjs/cache-manager';
import { TeamModule } from './modules/team.module';
import { HackathonModule } from './modules/hackathon.module';
import { CategoryModule } from './modules/category.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      envFilePath: join(process.cwd(), '.env'),
    }),
    CacheModule.register({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    UserModule,
    AuthModule,
    TeamModule,
    HackathonModule,
    CategoryModule,
  ],
})
export class AppModule {}
