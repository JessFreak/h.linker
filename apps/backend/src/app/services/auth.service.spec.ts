import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { CategoryService } from './category.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ConflictException } from '@nestjs/common';
import { NotRegisteredException } from '../utils/exceptions/not-registered.exception';
import { PasswordRepeatException } from '../utils/exceptions/password-repeat.exception';
import { InvalidPasswordException } from '../utils/exceptions/invalid-password-exception';
import config from '../../config/config';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let categoryService: CategoryService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: config.KEY,
          useValue: { clientUrl: 'http://localhost:4200' },
        },
        {
          provide: UserService,
          useValue: {
            checkEmailUniqueness: jest.fn(),
            checkUsernameUniqueness: jest.fn(),
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            findByGithubId: jest.fn(),
            updateGithub: jest.fn(),
            delete: jest.fn(),
            updatePassword: jest.fn(),
          },
        },
        {
          provide: CategoryService,
          useValue: { syncUserSkills: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    categoryService = module.get<CategoryService>(CategoryService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('register: should call uniqueness checks and create user', async () => {
    const dto = { email: 'e', username: 'u' } as any;
    await service.register(dto);
    expect(userService.checkEmailUniqueness).toHaveBeenCalledWith('e');
    expect(userService.checkUsernameUniqueness).toHaveBeenCalledWith('u');
    expect(userService.create).toHaveBeenCalledWith(dto);
  });

  it('getToken: should sign JWT with userId', () => {
    const token = service.getToken('u1');
    expect(jwtService.sign).toHaveBeenCalledWith({ sub: 'u1' });
    expect(token).toBe('token');
  });

  it('login: should throw NotRegisteredException if user not found', async () => {
    (userService.findByEmail as jest.Mock).mockResolvedValue(null);
    await expect(
      service.login({ email: 'a', password: 'b' } as any),
    ).rejects.toThrow(NotRegisteredException);
  });

  it('login: should throw InvalidPasswordException if password mismatch', async () => {
    (userService.findByEmail as jest.Mock).mockResolvedValue({
      password: 'hash',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(
      service.login({ email: 'a', password: 'b' } as any),
    ).rejects.toThrow(InvalidPasswordException);
  });

  it('login: should return token if password valid', async () => {
    (userService.findByEmail as jest.Mock).mockResolvedValue({
      id: 'u1',
      password: 'hash',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const result = await service.login({ email: 'a', password: 'b' } as any);
    expect(result).toBe('token');
  });

  it('validateGoogleUser: should create user if not found', async () => {
    (userService.findByEmail as jest.Mock).mockResolvedValue(null);
    (userService.create as jest.Mock).mockResolvedValue({ id: 'u1' });
    const user = await service.validateGoogleUser({ email: 'e' } as any);
    expect(user.id).toBe('u1');
  });

  it('validateGoogleUser: should return existing user', async () => {
    (userService.findByEmail as jest.Mock).mockResolvedValue({ id: 'u2' });
    const user = await service.validateGoogleUser({ email: 'e' } as any);
    expect(user.id).toBe('u2');
  });

  it('validateGithubUser: should link account if currentUser provided', async () => {
    (userService.updateGithub as jest.Mock).mockResolvedValue({ id: 'u1' });
    const gitHub = {
      githubId: 'g1',
      githubUsername: 'alex',
      skills: [],
    } as any;
    const user = await service.validateGithubUser(gitHub, { id: 'u1' } as any);
    expect(userService.updateGithub).toHaveBeenCalledWith('u1', 'g1', 'alex');
    expect(user.id).toBe('u1');
  });

  it('validateGithubUser: should sync skills if provided', async () => {
    (userService.findByGithubId as jest.Mock).mockResolvedValue({ id: 'u1' });
    (categoryService.syncUserSkills as jest.Mock).mockReturnValue({
      catch: jest.fn(),
    });
    const gitHub = {
      githubId: 'g1',
      githubUsername: 'alex',
      skills: ['TS'],
    } as any;
    await service.validateGithubUser(gitHub);
    expect(categoryService.syncUserSkills).toHaveBeenCalledWith('u1', ['TS']);
  });

  it('handleAccountLinking: should throw ConflictException if linked to another user', async () => {
    (userService.findByGithubId as jest.Mock).mockResolvedValue({ id: 'u2' });
    await expect(
      service['handleAccountLinking']({ id: 'u1' } as any, 'g1', 'alex'),
    ).rejects.toThrow(ConflictException);
  });

  it('handleAccountLinking: should updateGithub if same user or not linked', async () => {
    (userService.findByGithubId as jest.Mock).mockResolvedValue(null);
    (userService.updateGithub as jest.Mock).mockResolvedValue({ id: 'u1' });
    const result = await service['handleAccountLinking'](
      { id: 'u1' } as any,
      'g1',
      'alex',
    );
    expect(result.id).toBe('u1');
  });

  it('handleGithubAuth: should return existing GitHub user', async () => {
    (userService.findByGithubId as jest.Mock).mockResolvedValue({ id: 'u1' });
    const result = await service['handleGithubAuth']({ githubId: 'g1' } as any);
    expect(result.id).toBe('u1');
  });

  it('handleGithubAuth: should update existing email user', async () => {
    (userService.findByGithubId as jest.Mock).mockResolvedValue(null);
    (userService.findByEmail as jest.Mock).mockResolvedValue({ id: 'u1' });
    (userService.updateGithub as jest.Mock).mockResolvedValue({ id: 'u1' });
    const result = await service['handleGithubAuth']({
      githubId: 'g1',
      email: 'e',
      githubUsername: 'alex',
    } as any);
    expect(result.id).toBe('u1');
  });

  it('handleGithubAuth: should create new user if not found', async () => {
    (userService.findByGithubId as jest.Mock).mockResolvedValue(null);
    (userService.findByEmail as jest.Mock).mockResolvedValue(null);
    (userService.create as jest.Mock).mockResolvedValue({ id: 'u3' });
    const result = await service['handleGithubAuth']({
      githubId: 'g1',
      email: 'e',
    } as any);
    expect(result.id).toBe('u3');
  });

  it('setToken: should set cookie and redirect', () => {
    const res = { cookie: jest.fn(), redirect: jest.fn() } as any;
    service.setToken('u1', res);
    expect(res.cookie).toHaveBeenCalledWith('access_token', 'token');
    expect(res.redirect).toHaveBeenCalledWith('http://localhost:4200');
  });

  it('deleteMe: should call userService.delete', async () => {
    await service.deleteMe('u1');
    expect(userService.delete).toHaveBeenCalledWith('u1');
  });

  it('updatePassword: should validate old password and hash new one', async () => {
    (userService.findById as jest.Mock).mockResolvedValue({ password: 'hash' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNew');
    await service.updatePassword('u1', {
      oldPassword: 'old',
      newPassword: 'new',
    } as any);
    expect(bcrypt.hash).toHaveBeenCalledWith('new', 10);
    expect(userService.updatePassword).toHaveBeenCalledWith('u1', 'hashedNew');
  });

  it('updatePassword: should throw InvalidPasswordException if old password invalid', async () => {
    (userService.findById as jest.Mock).mockResolvedValue({ password: 'hash' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(
      service.updatePassword('u1', {
        oldPassword: 'x',
        newPassword: 'y',
      } as any),
    ).rejects.toThrow(InvalidPasswordException);
  });

  it('updatePassword: should throw PasswordRepeatException if passwords match', async () => {
    (userService.findById as jest.Mock).mockResolvedValue({ password: 'hash' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    await expect(
      service.updatePassword('u1', {
        oldPassword: 'same',
        newPassword: 'same',
      } as any),
    ).rejects.toThrow(PasswordRepeatException);
  });

  it('updatePassword: should skip validation if user has no password', async () => {
    (userService.findById as jest.Mock).mockResolvedValue({ password: null });
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    await service.updatePassword('u1', {
      oldPassword: 'x',
      newPassword: 'y',
    } as any);
    expect(userService.updatePassword).toHaveBeenCalledWith('u1', 'hashed');
  });
});
