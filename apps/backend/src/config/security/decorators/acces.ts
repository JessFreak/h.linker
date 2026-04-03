import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

//add more checks
export function Access() {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
  );
}
