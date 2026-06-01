import 'reflect-metadata';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UserMapper } from '../../../app/utils/mappers/user.mapper';

jest.mock('../../../app/utils/mappers/user.mapper', () => ({
  UserMapper: {
    getUserResponse: jest.fn(),
  },
}));

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockJwtService: any;
  let mockUserRepository: any;

  beforeEach(() => {
    mockJwtService = { verify: jest.fn() };
    mockUserRepository = { findById: jest.fn() };
    guard = new JwtAuthGuard(mockJwtService, mockUserRepository);
    jest.clearAllMocks();
  });

  const createMockContext = (reqObject: any): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => reqObject,
      }),
    }) as any;

  it('should throw UnauthorizedException if no token is provided', async () => {
    const context = createMockContext({ cookies: {} });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Token not found'),
    );
  });

  it('should throw UnauthorizedException if user is not found', async () => {
    const context = createMockContext({
      cookies: { access_token: 'valid_token' },
    });

    mockJwtService.verify.mockReturnValue({ sub: 'user123' });
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Unauthorized'),
    );
  });

  it('should set request.user and return true if successful', async () => {
    const req = { cookies: { access_token: 'valid_token' } };
    const context = createMockContext(req);

    const mockDbUser = { id: 'user123', email: 'test@test.com' };
    const mockMappedUser = {
      id: 'user123',
      email: 'test@test.com',
      mapped: true,
    };

    mockJwtService.verify.mockReturnValue({ sub: 'user123' });
    mockUserRepository.findById.mockResolvedValue(mockDbUser);
    (UserMapper.getUserResponse as jest.Mock).mockReturnValue(mockMappedUser);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockJwtService.verify).toHaveBeenCalledWith('valid_token');
    expect(mockUserRepository.findById).toHaveBeenCalledWith('user123');
    expect(UserMapper.getUserResponse).toHaveBeenCalledWith(mockDbUser);
    expect((req as any).user).toEqual(mockMappedUser);
  });

  it('should throw UnauthorizedException("JWT token expired") on TokenExpiredError', async () => {
    const context = createMockContext({
      cookies: { access_token: 'expired_token' },
    });

    const expiredError = new Error('jwt expired');
    expiredError.name = 'TokenExpiredError';
    mockJwtService.verify.mockImplementation(() => {
      throw expiredError;
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('JWT token expired'),
    );
  });

  it('should throw UnauthorizedException("Unauthorized") on other errors', async () => {
    const context = createMockContext({
      cookies: { access_token: 'invalid_token' },
    });

    mockJwtService.verify.mockImplementation(() => {
      throw new Error('Some unknown JWT error');
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Unauthorized'),
    );
  });
});
