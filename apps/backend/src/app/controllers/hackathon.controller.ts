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
  HackathonResponse,
  HackathonsResponse,
  SetCategoriesDTO,
  SetCriteriaDTO,
  UpdateHackathonDTO,
  UpdateHackathonStatusDTO,
  UserResponse,
} from '@h.linker/libs';
import { HackathonService } from '../services/hackathon.service';
import { UserRequest } from '../../config/security/decorators/user-request';
import { HackathonMapper } from '../utils/mappers/hackathon.mapper';

@Controller('hackathons')
export class HackathonController {
  constructor(private readonly hackathonService: HackathonService) {}

  @Get()
  async getAll(): Promise<HackathonsResponse> {
    const hackathons = await this.hackathonService.getAll();
    return HackathonMapper.getHackathonsResponse(hackathons);
  }

  @Get(':id')
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<HackathonResponse> {
    const hackathon = await this.hackathonService.getById(id);
    return HackathonMapper.getHackathonResponse(hackathon);
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
  ): Promise<HackathonResponse> {
    const hackathon = await this.hackathonService.create(user.id, dto);
    return HackathonMapper.getHackathonResponse(hackathon);
  }

  @Patch(':id')
  @Access('ADMIN')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHackathonDTO,
  ): Promise<HackathonResponse> {
    const hackathon = await this.hackathonService.update(id, dto);
    return HackathonMapper.getHackathonResponse(hackathon);
  }

  @Patch(':id/status')
  @Access('ADMIN')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHackathonStatusDTO,
  ): Promise<HackathonResponse> {
    const hackathon = await this.hackathonService.updateStatus(id, dto.status);
    return HackathonMapper.getHackathonResponse(hackathon);
  }

  @Put(':id/criteria')
  @Access('ADMIN')
  async setCriteria(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetCriteriaDTO,
  ): Promise<void> {
    await this.hackathonService.setCriteria(id, dto.criteria);
  }

  @Put(':id/categories')
  @Access('ADMIN')
  async setCategories(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetCategoriesDTO,
  ): Promise<void> {
    await this.hackathonService.setCategories(id, dto.categories);
  }

  @Post(':id/jury')
  @Access('ADMIN')
  async addJury(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddJuryDTO,
  ): Promise<void> {
    await this.hackathonService.addJuryMember(id, dto.userId);
  }

  @Delete(':id/jury/:userId')
  @Access('ADMIN')
  async removeJury(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<void> {
    await this.hackathonService.removeJuryMember(id, userId);
  }

  @Delete(':id')
  @Access('ADMIN')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.hackathonService.deleteById(id);
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
