import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma.module';
import { UserModule } from './modules/user.module';
import { AuthModule } from './modules/auth.module';
import { ConfigModule } from '@nestjs/config';
import config from '../config/config';
import { join } from 'path';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      envFilePath: join(process.cwd(), '.env'),
    }),
    CacheModule.register({ isGlobal: true }),
    PrismaModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
