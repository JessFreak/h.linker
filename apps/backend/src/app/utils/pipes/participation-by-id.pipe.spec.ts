import 'reflect-metadata';
import { ParticipationByIdPipe } from './participation-by-id.pipe';
import { runBasePipeTests } from './base-pipe.spec';

describe('ParticipationByIdPipe', () => {
  const mockRepo = { checkExistsById: jest.fn() };
  runBasePipeTests(
    ParticipationByIdPipe,
    mockRepo,
    'checkExistsById',
    'part-uuid-123',
  );
});
