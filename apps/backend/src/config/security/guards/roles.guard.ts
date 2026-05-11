import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, UserRole } from '../decorators/roles';
import { HackathonRepository } from '../../../app/database/repositories/hackathon.repository';
import { JuryRepository } from '../../../app/database/repositories/jury.repository';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private hackathonRepository: HackathonRepository,
    private juryRepository: JuryRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const hackathonId = request.params.id;

    if (!user) return false;

    const roleChecks: Record<string, () => Promise<boolean>> = {
      ADMIN: () => this.hackathonRepository.isCreator(hackathonId, user.id),
      JURY: () => this.juryRepository.isUserInJury(hackathonId, user.id),
    };

    const requiredCheckPromises = requiredRoles
      .filter((role) => roleChecks[role])
      .map((role) => roleChecks[role]());

    const results = await Promise.all(requiredCheckPromises);
    return results.some((res) => res);
  }
}