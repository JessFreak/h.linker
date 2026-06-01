import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { PrismaPg } from '@prisma/adapter-pg';

// Мокаємо адаптер
jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn().mockImplementation(() => ({})),
}));

// Мокаємо сам PrismaClient
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      $connect = jest.fn();
      $disconnect = jest.fn();
    },
  };
});

describe('PrismaService', () => {
  let service: PrismaService;
  let originalDbUrl: string | undefined;

  beforeAll(() => {
    originalDbUrl = process.env['DATABASE_URL'];
    process.env['DATABASE_URL'] =
      'postgres://test_user:test_pass@localhost:5432/test_db';
  });

  afterAll(() => {
    process.env['DATABASE_URL'] = originalDbUrl;
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should instantiate PrismaPg with DATABASE_URL from process.env', () => {
    expect(service).toBeDefined();

    expect(PrismaPg).toHaveBeenCalledWith({
      connectionString: 'postgres://test_user:test_pass@localhost:5432/test_db',
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should call $connect on onModuleInit', async () => {
      const connectSpy = jest
        .spyOn(service, '$connect')
        .mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(connectSpy).toHaveBeenCalled();
    });

    it('should call $disconnect on onModuleDestroy', async () => {
      const disconnectSpy = jest
        .spyOn(service, '$disconnect')
        .mockResolvedValue(undefined);

      await service.onModuleDestroy();

      expect(disconnectSpy).toHaveBeenCalled();
    });
  });
});
