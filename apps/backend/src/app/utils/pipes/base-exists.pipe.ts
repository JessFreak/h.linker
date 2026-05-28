import { PipeTransform, NotFoundException } from '@nestjs/common';

export abstract class BaseExistsPipe
  implements PipeTransform<string, Promise<string>>
{
  protected constructor(
    private readonly entityName: string,
    private readonly checkExistsFn: (value: string) => Promise<boolean>,
  ) {}

  async transform(value: string): Promise<string> {
    const exists = await this.checkExistsFn(value);

    if (!exists) {
      throw new NotFoundException(`${this.entityName} '${value}' not found`);
    }

    return value;
  }
}
