import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { UserRepository } from '../../../app/database/repositories/user.repository';
import { UserMapper } from '../../../app/utils/mappers/user.mapper';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies['access_token'];

    if (!token) {
      return true;
    }

    try {
      const { sub } = this.jwtService.verify(token);
      const user = await this.userRepository.findById(sub);

      if (user) {
        request.user = UserMapper.getUserResponse(user);
      }
    } catch {
      request.user = undefined;
    }

    return true;
  }
}
