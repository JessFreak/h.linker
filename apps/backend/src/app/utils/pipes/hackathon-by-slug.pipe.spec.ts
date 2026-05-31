import 'reflect-metadata';
import { HackathonBySlugPipe } from './hackathon-by-slug.pipe';
import { runBasePipeTests } from './base-pipe.spec';

describe('HackathonBySlugPipe', () => {
  const mockRepo = { checkExistsBySlug: jest.fn() };
  runBasePipeTests(
    HackathonBySlugPipe,
    mockRepo,
    'checkExistsBySlug',
    'test-slug',
  );
});
