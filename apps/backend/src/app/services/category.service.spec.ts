import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { CategoryRepository } from '../database/repositories/category.repository';

describe('CategoryService', () => {
  let service: CategoryService;
  let repository: CategoryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: CategoryRepository,
          useValue: {
            upsertCategory: jest.fn(),
            linkUserToCategory: jest.fn(),
            deleteUserSkills: jest.fn(),
            search: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    repository = module.get<CategoryRepository>(CategoryRepository);
  });

  it('syncUserSkills: should upsert and link for every skill', async () => {
    const skills = ['NestJS', 'React'];
    const userId = 'user-1';

    await service.syncUserSkills(userId, skills);

    expect(repository.upsertCategory).toHaveBeenCalledTimes(2);
    expect(repository.linkUserToCategory).toHaveBeenCalledTimes(2);
    expect(repository.linkUserToCategory).toHaveBeenCalledWith(
      userId,
      'NestJS',
    );
  });

  it('deleteUserSkills: should call repository delete', async () => {
    const userId = 'user-1';
    await service.deleteUserSkills(userId);
    expect(repository.deleteUserSkills).toHaveBeenCalledWith(userId);
  });

  it('search: should return categories based on query', async () => {
    const mockCategories = [{ id: '1', category: 'TypeScript' }];
    (repository.search as jest.Mock).mockResolvedValue(mockCategories);

    const result = await service.search('Type');

    expect(result).toEqual(mockCategories);
    expect(repository.search).toHaveBeenCalledWith('Type');
  });

  it('search: should call search without query if not provided', async () => {
    await service.search();
    expect(repository.search).toHaveBeenCalledWith(undefined);
  });
});
