import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '../database/repositories/user.repository';
import { CategoryService } from './category.service';
import * as bcrypt from 'bcryptjs';
import { AlreadyExistsException } from '../utils/exceptions/already-exists.exception';
import { NotRegisteredException } from '../utils/exceptions/not-registered.exception';

jest.mock('bcryptjs');

describe('UserService', () => {
  let service: UserService;
  let userRepo: any;
  let catService: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    userRepo = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      findById: jest.fn(),
      findAllPaged: jest.fn(),
      findRecommendedPaged: jest.fn(),
      findByGithubId: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
    };
    catService = { deleteUserSkills: jest.fn(), syncUserSkills: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: userRepo },
        { provide: CategoryService, useValue: catService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('create: should hash password if provided', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    await service.create({ password: 'plain' } as any);
    expect(bcrypt.hash).toHaveBeenCalledWith('plain', 10);
    expect(userRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ password: 'hashed' }),
    );
  });

  it('create: should not hash if password not provided', async () => {
    await service.create({ email: 'test@test.com' } as any);
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(userRepo.create).toHaveBeenCalledWith({ email: 'test@test.com' });
  });

  it('findByEmail: should delegate to repository', async () => {
    await service.findByEmail('mail@test.com');
    expect(userRepo.findByEmail).toHaveBeenCalledWith('mail@test.com');
  });

  it('findByUsername: should delegate with default full=false', async () => {
    await service.findByUsername('alex');
    expect(userRepo.findByUsername).toHaveBeenCalledWith('alex', false);
  });

  it('findByUsername: should delegate with full=true', async () => {
    await service.findByUsername('alex', true);
    expect(userRepo.findByUsername).toHaveBeenCalledWith('alex', true);
  });

  it('findById: should throw if user not found', async () => {
    userRepo.findById.mockResolvedValue(null);
    await expect(service.findById('u1')).rejects.toThrow(
      NotRegisteredException,
    );
  });

  it('findById: should return user if found', async () => {
    userRepo.findById.mockResolvedValue({ id: 'u1' });
    const result = await service.findById('u1');
    expect(result).toEqual({ id: 'u1' });
  });

  it('findByGithubId: should delegate to repository', async () => {
    await service.findByGithubId('gh123');
    expect(userRepo.findByGithubId).toHaveBeenCalledWith('gh123');
  });

  it('updateGithub: should call updateById with github data', async () => {
    await service.updateGithub('u1', 'gh123', 'alexGH');
    expect(userRepo.updateById).toHaveBeenCalledWith('u1', {
      githubId: 'gh123',
      githubUsername: 'alexGH',
    });
  });

  it('updatePassword: should call updateById with hashed password', async () => {
    await service.updatePassword('u1', 'hashedPass');
    expect(userRepo.updateById).toHaveBeenCalledWith('u1', {
      password: 'hashedPass',
    });
  });

  it('updateProfile: should sync skills and update user', async () => {
    const dto = { username: 'new', skills: ['TS'] };
    userRepo.findByUsername.mockResolvedValue(null);

    await service.updateProfile('u1', dto as any);

    expect(catService.deleteUserSkills).toHaveBeenCalledWith('u1');
    expect(catService.syncUserSkills).toHaveBeenCalledWith('u1', ['TS']);
    expect(userRepo.updateById).toHaveBeenCalledWith(
      'u1',
      expect.not.objectContaining({ skills: ['TS'] }),
    );
  });

  it('updateProfile: should not pass skills to updateById if none provided', async () => {
    const dto = { firstName: 'NewName' };
    await service.updateProfile('u1', dto as any);
    expect(userRepo.updateById).toHaveBeenCalledWith('u1', {
      firstName: 'NewName',
    });
  });

  it('delete: should call deleteById', async () => {
    await service.delete('u1');
    expect(userRepo.deleteById).toHaveBeenCalledWith('u1');
  });

  it('checkEmailUniqueness: should throw if email exists and not same user', async () => {
    userRepo.findByEmail.mockResolvedValue({ id: 'u2' });
    await expect(service.checkEmailUniqueness('e@e.com', 'u1')).rejects.toThrow(
      AlreadyExistsException,
    );
  });

  it('checkEmailUniqueness: should not throw if email is unique', async () => {
    userRepo.findByEmail.mockResolvedValue(null);
    await expect(
      service.checkEmailUniqueness('new@e.com'),
    ).resolves.not.toThrow();
  });

  it('checkUsernameUniqueness: should throw if username exists and not same user', async () => {
    userRepo.findByUsername.mockResolvedValue({ id: 'u2' });
    await expect(service.checkUsernameUniqueness('alex', 'u1')).rejects.toThrow(
      AlreadyExistsException,
    );
  });

  it('checkUsernameUniqueness: should not throw if username is same user', async () => {
    userRepo.findByUsername.mockResolvedValue({ id: 'u1' });
    await expect(
      service.checkUsernameUniqueness('alex', 'u1'),
    ).resolves.not.toThrow();
  });

  it('getAll: should call findAllPaged with filters', async () => {
    const query = { search: 'John', categories: ['AI'] } as any;
    await service.getAll(query);
    expect(userRepo.findAllPaged).toHaveBeenCalledWith(
      query,
      expect.objectContaining({
        OR: expect.any(Array),
        skills: { some: { category: { in: ['AI'] } } },
      }),
      expect.anything(),
    );
  });

  it('getAll: should call findRecommendedPaged if isRecommended is true', async () => {
    const query = { isRecommended: true } as any;
    const currentUser = { id: 'u1', skills: ['TS'] } as any;
    await service.getAll(query, currentUser);
    expect(userRepo.findRecommendedPaged).toHaveBeenCalledWith(
      query,
      expect.anything(),
      ['TS'],
    );
  });

  it('getAll: should exclude current user if excludeSelf is true', async () => {
    const query = { excludeSelf: true } as any;
    const currentUser = { id: 'u1' } as any;
    await service.getAll(query, currentUser);
    expect(userRepo.findAllPaged).toHaveBeenCalledWith(
      query,
      expect.objectContaining({ id: { not: 'u1' } }),
      expect.anything(),
    );
  });
});
