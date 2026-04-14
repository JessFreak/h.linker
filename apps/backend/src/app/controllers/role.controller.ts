import { Controller, Get, Post, Body } from '@nestjs/common';
import { RoleService } from '../services/role.service';
import { RoleResponse, RolesResponse } from '@h.linker/libs';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  async getAll(): Promise<RolesResponse> {
    const roles = await this.roleService.getAll()
    return { roles };
  }

  @Post()
  async create(@Body('name') name: string): Promise<RoleResponse> {
    return this.roleService.create(name);
  }
}
