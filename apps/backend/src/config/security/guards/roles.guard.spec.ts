import 'reflect-metadata';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let mockReflector: any;
  let mockHackRepo: any;
  let mockJuryRepo: any;

  const createMockContext = (requestData: any) =>
    ({
      switchToHttp: () => ({ getRequest: () => requestData }),
      getHandler: () => ({}),
      getClass: () => ({}),
    }) as any;

  beforeEach(() => {
    mockReflector = { getAllAndOverride: jest.fn() };
    mockHackRepo = { isCreator: jest.fn() };
    mockJuryRepo = { isUserInJury: jest.fn() };
    guard = new RolesGuard(mockReflector, mockHackRepo, mockJuryRepo);
  });

  it('should allow access if no roles are required', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(null);
    const context = createMockContext({});
    expect(await guard.canActivate(context)).toBe(true);
  });

  it('should deny access if user is missing', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context = createMockContext({ user: null, params: {} });
    expect(await guard.canActivate(context)).toBe(false);
  });

  it('should allow ADMIN if isCreator returns true', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context = createMockContext({
      user: { id: 'u1' },
      params: { id: 'h1' },
    });
    mockHackRepo.isCreator.mockResolvedValue(true);
    expect(await guard.canActivate(context)).toBe(true);
  });

  it('should deny JURY if isUserInJury returns false', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(['JURY']);
    const context = createMockContext({
      user: { id: 'u1' },
      params: { id: 'h1' },
    });
    mockJuryRepo.isUserInJury.mockResolvedValue(false);
    expect(await guard.canActivate(context)).toBe(false);
  });
});
