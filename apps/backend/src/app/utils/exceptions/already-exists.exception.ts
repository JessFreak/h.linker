import { ConflictException } from '@nestjs/common';

export class AlreadyExistsException extends ConflictException {
  constructor(entity: string, property: string) {
    super(`${entity} with this ${property} already exists`);
  }
}
