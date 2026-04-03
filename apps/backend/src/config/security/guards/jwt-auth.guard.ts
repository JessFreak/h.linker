import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { UserRepository } from '../../../app/database/repositories/user.repository';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
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
      throw new UnauthorizedException('Token not found');
    }

    try {
      const { sub } = this.jwtService.verify(token);

      const user = await this.userRepository.findById(sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      delete user.password;
      request.user = user;

      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('JWT token expired');
      }
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
