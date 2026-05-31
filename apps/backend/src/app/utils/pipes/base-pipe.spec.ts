import { NotFoundException } from '@nestjs/common';

export function runBasePipeTests(
  PipeClass: any,
  mockRepo: any,
  repoMethod: string,
  testValue: string,
) {
  let pipe: any;

  beforeEach(() => {
    pipe = new PipeClass(mockRepo);
  });

  it('should return value if entity exists', async () => {
    mockRepo[repoMethod].mockResolvedValue(true);
    const result = await pipe.transform(testValue);
    expect(result).toBe(testValue);
  });

  it('should throw NotFoundException if entity does not exist', async () => {
    mockRepo[repoMethod].mockResolvedValue(false);
    await expect(pipe.transform(testValue)).rejects.toThrow(NotFoundException);
  });
}

describe('Factory File', () => {
  it('should be a helper', () => {
    expect(true).toBe(true);
  });
});