import { Module } from '@nestjs/common';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { CategoryModule } from './category.module';
import { UserByIdPipe } from '../utils/pipes/user-by-id.pipe';
import { UserByUsernamePipe } from '../utils/pipes/user-by-username.pipe';

@Module({
  controllers: [UserController],
  providers: [UserService, UserByIdPipe, UserByUsernamePipe],
  exports: [UserService, UserByIdPipe, UserByUsernamePipe],
  imports: [CategoryModule],
})
export class UserModule {}