import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Put,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Access } from '../../config/security/decorators/access';
import {
  AddJuryDTO,
  CreateHackathonDTO,
  HackathonStatus,
  SetCriteriaDTO,
  UpdateHackathonDTO,
  UpdateHackathonStatusDTO,
  UserResponse,
} from '@h.linker/libs';
import { HackathonService } from '../services/hackathon.service';
import { UserRequest } from '../../config/security/decorators/user-request';

@Controller('hackathons')
export class HackathonController {
  constructor(private readonly hackathonService: HackathonService) {}

  @Get()
  async getAll() {
    return this.hackathonService.getAll();
  }

  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.hackathonService.getById(id);
  }

  @Get(':id/leaderboard')
  async getLeaderboard(@Param('id') id: string) {
    // Таблиця результатів: Команда -> Сума балів
  }

  @Post()
  @Access()
  async create(
    @UserRequest() user: UserResponse,
    @Body() dto: CreateHackathonDTO,
  ) {
    return this.hackathonService.create(user.id, dto);
  }

  @Patch(':id')
  @Access('ADMIN')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHackathonDTO,
  ) {
    return this.hackathonService.update(id, dto);
  }

  @Patch(':id/status')
  @Access('ADMIN')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHackathonStatusDTO,
  ) {
    return this.hackathonService.updateStatus(id, dto.status);
  }

  @Put(':id/criteria')
  @Access('ADMIN')
  async setCriteria(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetCriteriaDTO,
  ) {
    return this.hackathonService.setCriteria(id, dto.criteria);
  }

  @Delete(':id/categories/:name')
  @Access('ADMIN')
  async removeCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('name') name: string,
  ) {
    return this.hackathonService.removeCategory(id, name);
  }

  @Post(':id/jury')
  @Access('ADMIN')
  async addJury(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddJuryDTO,
  ) {
    return this.hackathonService.addJuryMember(id, dto.userId);
  }

  @Delete(':id/jury/:userId')
  @Access('ADMIN')
  async removeJury(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.hackathonService.removeJuryMember(id, userId);
  }

  @Delete(':id')
  @Access('ADMIN')
  async remove(@Param('id') id: string): Promise<void> {
    return this.hackathonService.deleteById(id);
  }

  ///////////////////////////////////////////////////////////////////////////////

  @Post(':id/register')
  @Access() // Будь-який авторизований лідер команди
  async registerTeam(@Param('id') id: string, @Body('teamId') teamId: string) {
    // Реєстрація команди на івент
  }

  @Post(':id/submit')
  @Access()
  async submitProject(@Param('id') id: string, @Body() dto: any) {
    // SubmitProjectDto: teamId, repoUrl, projectDescription, demoUrl
  }

  @Get(':id/submissions')
  @Access('JURY')
  async getSubmissions(@Param('id') id: string) {
    // Список усіх зданих проектів для оцінювання
  }

  @Post(':id/projects/:projectId/score')
  @Access('JURY')
  async setScore(
    @Param('id') id: string,
    @Param('projectId') projectId: string,
    @Body() scores: any, // { criterionId: scoreValue }
  ) {
    // Виставлення балів за критеріями
  }

  @Post(':id/projects/:projectId/comment')
  @Access('JURY')
  async addComment(
    @Param('id') id: string,
    @Param('projectId') projectId: string,
    @Body('text') text: string,
  ) {
    // Коментар жюрі до роботи команди
  }
}
