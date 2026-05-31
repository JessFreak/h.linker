import 'reflect-metadata';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';
import { UserMapper } from '../../../app/utils/mappers/user.mapper';

describe('OptionalJwtAuthGuard', () => {
  let guard: OptionalJwtAuthGuard;
  let mockJwtService: any;
  let mockUserRepo: any;

  beforeEach(() => {
    mockJwtService = { verify: jest.fn() };
    mockUserRepo = { findById: jest.fn() };
    guard = new OptionalJwtAuthGuard(mockJwtService, mockUserRepo);
  });

  it('should return true and keep user undefined if no token', async () => {
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ cookies: {} }) }),
    } as any;

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(context.switchToHttp().getRequest().user).toBeUndefined();
  });

  it('should set request.user if token is valid and user exists', async () => {
    const mockUser = { id: 'u1' };
    mockJwtService.verify.mockReturnValue({ sub: 'u1' });
    mockUserRepo.findById.mockResolvedValue(mockUser);
    jest
      .spyOn(UserMapper, 'getUserResponse')
      .mockReturnValue({ id: 'u1' } as any);

    const req = { cookies: { access_token: 'valid' } } as any;
    const context = { switchToHttp: () => ({ getRequest: () => req }) } as any;

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe('u1');
  });

  it('should return true and user undefined if token is invalid', async () => {
    mockJwtService.verify.mockImplementation(() => {
      throw new Error();
    });

    const req = { cookies: { access_token: 'invalid' } } as any;
    const context = { switchToHttp: () => ({ getRequest: () => req }) } as any;

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(req.user).toBeUndefined();
  });
});
