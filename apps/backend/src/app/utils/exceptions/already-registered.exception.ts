import { BadRequestException } from '@nestjs/common';

export class AlreadyRegisteredException extends BadRequestException {
  constructor(entity: string, property: string) {
    super(`${entity} with this ${property} already exists`);
  }
}
