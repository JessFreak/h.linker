import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TeamService } from '../services/team.service';
import { TeamMapper } from '../utils/mappers/team.mapper';
import {
  AddMemberDTO,
  CreateTeamDTO,
  UpdateTeamDTO,
  TeamResponse,
  TeamsResponse,
} from '@h.linker/libs';
import { User, UserTeamStatus } from '@prisma/client';
import { Access } from '../../config/security/decorators/acces';
import { UserRequest } from '../../config/security/decorators/user-request';

@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Access()
  @Post()
  async create(
    @Body() dto: CreateTeamDTO,
    @UserRequest() user: User,
  ): Promise<TeamResponse> {
    const team = await this.teamService.create(dto, user.id);
    return TeamMapper.getTeamResponse(team);
  }

  @Get()
  async getAll(): Promise<TeamsResponse> {
    const teams = await this.teamService.getAll();
    return TeamMapper.getTeamsResponse(teams);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<TeamResponse> {
    const team = await this.teamService.findById(id);
    return TeamMapper.getTeamResponse(team);
  }

  @Get('user/:userId')
  async getByUserId(@Param('userId') userId: string): Promise<TeamsResponse> {
    const teams = await this.teamService.findByUserId(userId);
    return TeamMapper.getTeamsResponse(teams);
  }

  @Access()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTeamDTO,
  ): Promise<TeamResponse> {
    const team = await this.teamService.updateById(id, dto);
    return TeamMapper.getTeamResponse(team);
  }

  @Access()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.teamService.delete(id);
  }

  @Access()
  @Post(':id/members')
  async addMember(
    @Param('id') teamId: string,
    @Body() dto: AddMemberDTO,
  ): Promise<TeamResponse> {
    const team = await this.teamService.addMember(teamId, dto);
    return TeamMapper.getTeamResponse(team);
  }

  @Access()
  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') teamId: string,
    @Param('userId') userId: string,
  ): Promise<TeamResponse> {
    const team = await this.teamService.removeMember(teamId, userId);
    return TeamMapper.getTeamResponse(team);
  }

  @Access()
  @Patch(':id/members/:userId/status')
  async respondToRequest(
    @Param('id') teamId: string,
    @Param('userId') userId: string,
    @Body('status') status: UserTeamStatus,
  ): Promise<TeamResponse> {
    const team = await this.teamService.respondToMemberRequest(
      teamId,
      userId,
      status,
    );
    return TeamMapper.getTeamResponse(team);
  }

  @Access()
  @Patch(':id/leader')
  async changeLeader(
    @Param('id') id: string,
    @Body('newLeaderId') newLeaderId: string,
  ): Promise<TeamResponse> {
    const team = await this.teamService.changeLeader(id, newLeaderId);
    return TeamMapper.getTeamResponse(team);
  }

  @Access()
  @Delete(':id/leave')
  async leave(
    @Param('id') teamId: string,
    @UserRequest() user: User,
  ): Promise<TeamResponse> {
    const team = await this.teamService.leaveTeam(teamId, user.id);
    return TeamMapper.getTeamResponse(team);
  }
}
