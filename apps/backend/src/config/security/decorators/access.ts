import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Roles, UserRole } from './roles';
import { RolesGuard } from '../guards/roles.guard';

export function Access(...roles: UserRole[]) {
  return applyDecorators(Roles(...roles), UseGuards(JwtAuthGuard, RolesGuard));
}
