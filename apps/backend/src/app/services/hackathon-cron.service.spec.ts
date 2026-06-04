import { Test, TestingModule } from '@nestjs/testing';
import { HackathonCronService } from './hackathon.cron.service';
import { HackathonRepository } from '../database/repositories/hackathon.repository';

describe('HackathonCronService', () => {
  let service: HackathonCronService;
  let repository: HackathonRepository;

  const mockHackathonRepository = {
    updateToActive: jest.fn(),
    updateToFinished: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HackathonCronService,
        {
          provide: HackathonRepository,
          useValue: mockHackathonRepository,
        },
      ],
    }).compile();

    service = module.get<HackathonCronService>(HackathonCronService);
    repository = module.get<HackathonRepository>(HackathonRepository);

    jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);
    jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleHackathonStatuses', () => {
    const fixedDate = new Date('2026-06-04T12:00:00Z');

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(fixedDate);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should update statuses and log messages if hackathons were updated', async () => {
      (repository.updateToActive as jest.Mock).mockResolvedValue({ count: 2 });
      (repository.updateToFinished as jest.Mock).mockResolvedValue({
        count: 1,
      });

      await service.handleHackathonStatuses();

      expect(repository.updateToActive).toHaveBeenCalledWith(fixedDate);
      expect(repository.updateToFinished).toHaveBeenCalledWith(fixedDate);

      expect(service['logger'].log).toHaveBeenCalledWith(
        'Hackathons transitioned to ACTIVE: 2',
      );
      expect(service['logger'].log).toHaveBeenCalledWith(
        'Hackathons transitioned to FINISHED: 1',
      );
    });

    it('should not log messages if no hackathons were updated', async () => {
      (repository.updateToActive as jest.Mock).mockResolvedValue({ count: 0 });
      (repository.updateToFinished as jest.Mock).mockResolvedValue({
        count: 0,
      });

      await service.handleHackathonStatuses();

      expect(repository.updateToActive).toHaveBeenCalledWith(fixedDate);
      expect(repository.updateToFinished).toHaveBeenCalledWith(fixedDate);

      expect(service['logger'].log).not.toHaveBeenCalled();
    });

    it('should catch and log errors if database query fails', async () => {
      const mockError = new Error('Database connection lost');

      (repository.updateToActive as jest.Mock).mockRejectedValue(mockError);

      await service.handleHackathonStatuses();

      expect(service['logger'].error).toHaveBeenCalledWith(
        'Error during automatic hackathon status update',
        mockError,
      );

      expect(repository.updateToFinished).not.toHaveBeenCalled();
    });
  });
});
