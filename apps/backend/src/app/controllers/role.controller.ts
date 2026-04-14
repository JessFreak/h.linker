import { Controller, Get, Post, Body } from '@nestjs/common';
import { Role } from '@prisma/client';
import { RoleService } from '../services/role.service';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  async getAll(): Promise<Role[]> {
    return this.roleService.getAll();
  }

  @Post()
  async create(@Body('name') name: string): Promise<Role> {
    return this.roleService.create(name);
  }
}
