import { BadRequestException } from '@nestjs/common';

export class NotRegisteredException extends BadRequestException {
  constructor() {
    super('User with that email not registered');
  }
}
