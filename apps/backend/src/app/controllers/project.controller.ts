import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import {
  PageResponse,
  ProjectQueryDTO,
  ShowcaseProjectResponse,
} from '@h.linker/libs';
import { ProjectService } from '../services/project.service';
import { ProjectMapper } from '../utils/mappers/project.mapper';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getShowcase(
    @Query() query: ProjectQueryDTO,
  ): Promise<PageResponse<ShowcaseProjectResponse>> {
    const pagedResult = await this.projectService.getShowcaseProjects(query);

    const mappedData = pagedResult.data.map((project) =>
      ProjectMapper.getShowcaseProject(project),
    );

    return new PageResponse<ShowcaseProjectResponse>(
      mappedData,
      pagedResult.meta,
    );
  }
}
