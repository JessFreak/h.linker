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
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { Access } from '../../config/security/decorators/access';
import {
  AddCommentDto,
  AddJuryDTO,
  CreateHackathonDTO,
  FullHackathonResponse,
  HackathonInsightsResponse,
  HackathonsResponse,
  JurySubmissionsResponse,
  LeaderboardResponse,
  SetCategoriesDTO,
  SetCriteriaDTO,
  SetScoresDto,
  SubmitProjectDto,
  TeamReviewsResponse,
  UpdateHackathonDTO,
  UpdateHackathonStatusDTO,
  UserRegistrationStatusResponse,
  UserResponse,
} from '@h.linker/libs';
import { HackathonService } from '../services/hackathon.service';
import { UserRequest } from '../../config/security/decorators/user-request';
import { HackathonMapper } from '../utils/mappers/hackathon.mapper';
import { ParticipationMapper } from '../utils/mappers/participation.mapper';
import { HackathonByIdPipe } from '../utils/pipes/hackathon-by-id.pipe';
import { HackathonBySlugPipe } from '../utils/pipes/hackathon-by-slug.pipe';
import { UserByIdPipe } from '../utils/pipes/user-by-id.pipe';
import { ParticipationByIdPipe } from '../utils/pipes/participation-by-id.pipe';

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
    @Param('id', ParseUUIDPipe, HackathonByIdPipe) id: string,
  ): Promise<FullHackathonResponse> {
    const hackathon = await this.hackathonService.getById(id);
    return HackathonMapper.getHackathonResponse(hackathon);
  }

  @Get('s/:slug')
  async getBySlug(
    @Param('slug', HackathonBySlugPipe) slug: string,
  ): Promise<FullHackathonResponse> {
    const hackathon = await this.hackathonService.getBySlug(slug);
    return HackathonMapper.getHackathonResponse(hackathon);
  }

  @Post()
  @Access()
  async create(
    @UserRequest() user: UserResponse,
    @Body() dto: CreateHackathonDTO,
  ): Promise<FullHackathonResponse> {
    const hackathon = await this.hackathonService.create(user.id, dto);
    return HackathonMapper.getHackathonResponse(hackathon);
  }

  @Patch(':id')
  @Access('ADMIN')
  async update(
    @Param('id', ParseUUIDPipe, HackathonByIdPipe) id: string,
    @Body() dto: UpdateHackathonDTO,
  ): Promise<FullHackathonResponse> {
    const hackathon = await this.hackathonService.update(id, dto);
    return HackathonMapper.getHackathonResponse(hackathon);
  }

  @Patch(':id/status')
  @Access('ADMIN')
  async updateStatus(
    @Param('id', ParseUUIDPipe, HackathonByIdPipe) id: string,
    @Body() dto: UpdateHackathonStatusDTO,
  ): Promise<FullHackathonResponse> {
    const hackathon = await this.hackathonService.updateStatus(id, dto.status);
    return HackathonMapper.getHackathonResponse(hackathon);
  }

  @Put(':id/criteria')
  @Access('ADMIN')
  async setCriteria(
    @Param('id', ParseUUIDPipe, HackathonByIdPipe) id: string,
    @Body() dto: SetCriteriaDTO,
  ): Promise<void> {
    await this.hackathonService.setCriteria(id, dto.criteria);
  }

  @Put(':id/categories')
  @Access('ADMIN')
  async setCategories(
    @Param('id', ParseUUIDPipe, HackathonByIdPipe) id: string,
    @Body() dto: SetCategoriesDTO,
  ): Promise<void> {
    await this.hackathonService.setCategories(id, dto.categories);
  }

  @Post(':id/jury')
  @Access('ADMIN')
  async addJury(
    @Param('id', ParseUUIDPipe, HackathonByIdPipe) id: string,
    @Body() dto: AddJuryDTO,
  ): Promise<void> {
    await this.hackathonService.addJuryMember(id, dto.userId);
  }

  @Delete(':id/jury/:userId')
  @Access('ADMIN')
  async removeJury(
    @Param('id', ParseUUIDPipe, HackathonByIdPipe) id: string,
    @Param('userId', ParseUUIDPipe, UserByIdPipe) userId: string,
  ): Promise<void> {
    await this.hackathonService.removeJuryMember(id, userId);
  }

  @Delete(':id')
  @Access('ADMIN')
  async remove(
    @Param('id', ParseUUIDPipe, HackathonByIdPipe) id: string,
  ): Promise<void> {
    await this.hackathonService.deleteById(id);
  }

  @Get(':id/registration-status')
  @Access()
  async getRegistrationStatus(
    @Param('id', ParseUUIDPipe, HackathonByIdPipe) id: string,
    @UserRequest() user: UserResponse,
  ): Promise<UserRegistrationStatusResponse> {
    const registration = await this.hackathonService.findUserRegistration(
      id,
      user.id,
    );

    return ParticipationMapper.getRegistrationStatusResponse(registration);
  }

  @Get(':id/reviews')
  @Access()
  async getMySubmissionReviews(
    @Param('id', ParseUUIDPipe, HackathonByIdPipe) id: string,
    @UserRequest() user: UserResponse,
  ): Promise<TeamReviewsResponse> {
    const reviews = await this.hackathonService.findTeamReviews(id, user.id);

    return ParticipationMapper.getTeamReviewsResponse(reviews);
  }

  @Post(':id/register')
  @Access()
  @HttpCode(HttpStatus.OK)
  async registerTeam(
    @Param('id', ParseUUIDPipe, HackathonByIdPipe) id: string,
    @Body('teamId') teamId: string,
    @UserRequest() user: UserResponse,
  ): Promise<void> {
    await this.hackathonService.registerTeam(id, teamId, user.id);
  }

  @Post(':id/submit')
  @Access()
  @HttpCode(HttpStatus.OK)
  async submitProject(
    @Param('id', ParseUUIDPipe, HackathonByIdPipe) id: string,
    @Body() dto: SubmitProjectDto,
    @UserRequest() user: UserResponse,
  ): Promise<void> {
    await this.hackathonService.submitProject(id, user.id, dto);
  }

  @Get(':id/leaderboard')
  @HttpCode(HttpStatus.OK)
  async getLeaderboard(
    @Param('id', ParseUUIDPipe, HackathonByIdPipe) id: string,
  ): Promise<LeaderboardResponse> {
    const data = await this.hackathonService.getLeaderboard(id);
    return ParticipationMapper.getLeaderboardResponse(data);
  }

  @Get(':id/submissions')
  @Access('JURY')
  async getSubmissions(
    @Param('id', ParseUUIDPipe, HackathonByIdPipe) id: string,
    @UserRequest() user: UserResponse,
  ): Promise<JurySubmissionsResponse> {
    const participations =
      await this.hackathonService.getHackathonSubmissionsForJury(id);
    return ParticipationMapper.getJurySubmissionsResponse(
      participations,
      user.id,
    );
  }

  @Post(':id/projects/:projectId/score')
  @Access('JURY')
  @HttpCode(HttpStatus.OK)
  async setScore(
    @Param('id', ParseUUIDPipe, HackathonByIdPipe) id: string,
    @Param('projectId') participationId: string,
    @Body() dto: SetScoresDto,
    @UserRequest() user: UserResponse,
  ): Promise<void> {
    await this.hackathonService.setTeamScores(
      user.id,
      id,
      participationId,
      dto.scores,
    );
  }

  @Post(':id/projects/:projectId/comment')
  @Access('JURY')
  @HttpCode(HttpStatus.OK)
  async addComment(
    @Param('id', ParseUUIDPipe, HackathonByIdPipe) id: string,
    @Param('projectId', ParseUUIDPipe, ParticipationByIdPipe) participationId: string,
    @Body() dto: AddCommentDto,
    @UserRequest() user: UserResponse,
  ): Promise<void> {
    await this.hackathonService.setTeamComment(
      user.id,
      id,
      participationId,
      dto,
    );
  }

  @Get(':id/insights')
  @Access('ADMIN')
  async getInsights(
    @Param('id', ParseUUIDPipe, HackathonByIdPipe) id: string,
  ): Promise<HackathonInsightsResponse> {
    return this.hackathonService.getInsights(id);
  }
}
