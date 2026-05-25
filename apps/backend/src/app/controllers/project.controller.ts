import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

import { ProjectShowcaseResponse } from '@h.linker/libs';
import { ProjectService } from '../services/project.service';
import { ProjectMapper } from '../utils/mappers/project.mapper';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get('showcase')
  @HttpCode(HttpStatus.OK)
  async getShowcase(): Promise<ProjectShowcaseResponse> {
    const projects = await this.projectService.getTopShowcaseProjects();
    return ProjectMapper.getShowcaseProjects(projects);
  }
}
