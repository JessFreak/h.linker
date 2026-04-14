import { Injectable } from '@nestjs/common';
import { RoleRepository } from '../database/repositories/role.repository';
import { Role } from '@prisma/client';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async getAll(): Promise<Role[]> {
    return this.roleRepository.findMany();
  }

  async create(name: string): Promise<Role> {
    return this.roleRepository.create(name);
  }
}
