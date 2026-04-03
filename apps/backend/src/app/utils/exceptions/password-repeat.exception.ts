import { BadRequestException } from '@nestjs/common';

export class PasswordRepeatException extends BadRequestException {
  constructor() {
    super('New password cannot match previous password');
  }
}
