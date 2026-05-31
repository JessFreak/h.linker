import 'reflect-metadata';
import { TeamByIdPipe } from './team-by-id.pipe';
import { runBasePipeTests } from './base-pipe.spec';

describe('TeamByIdPipe', () => {
  const mockRepo = { checkExistsById: jest.fn() };
  runBasePipeTests(TeamByIdPipe, mockRepo, 'checkExistsById', 'team-uuid-123');
});
