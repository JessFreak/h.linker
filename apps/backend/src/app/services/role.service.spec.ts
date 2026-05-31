import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { RoleRepository } from '../database/repositories/role.repository';

describe('RoleService', () => {
  let service: RoleService;
  let repository: RoleRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: RoleRepository,
          useValue: {
            findMany: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    repository = module.get<RoleRepository>(RoleRepository);
  });

  it('getAll: should return all roles', async () => {
    const mockRoles = [{ id: '1', name: 'ADMIN' }];
    (repository.findMany as jest.Mock).mockResolvedValue(mockRoles);

    const result = await service.getAll();
    expect(result).toEqual(mockRoles);
    expect(repository.findMany).toHaveBeenCalledTimes(1);
  });

  it('create: should create a new role', async () => {
    const newRole = { id: '2', name: 'JURY' };
    (repository.create as jest.Mock).mockResolvedValue(newRole);

    const result = await service.create('JURY');
    expect(result).toEqual(newRole);
    expect(repository.create).toHaveBeenCalledWith('JURY');
  });
});
