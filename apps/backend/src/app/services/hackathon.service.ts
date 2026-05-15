import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HackathonRepository } from '../database/repositories/hackathon.repository';
import {
  CreateHackathonDTO,
  CriterionDTO,
  HackathonStatus,
  SubmitProjectDto,
  UpdateHackathonDTO,
} from '@h.linker/libs';
import { JuryRepository } from '../database/repositories/jury.repository';
import { CriteriaRepository } from '../database/repositories/criteria.repository';
import { CategoryRepository } from '../database/repositories/category.repository';
import { FullHackathon } from '../database/entities/hackathon.entity';
import { ParticipationRepository } from '../database/repositories/participation.repository';
import {
  LeaderboardRow,
  ParticipationWithTeam,
} from '../database/entities/participation.entity';
import { EvaluationRepository } from '../database/repositories/evaluation.repository';

@Injectable()
export class HackathonService {
  constructor(
    private readonly hackathonRepository: HackathonRepository,
    private readonly juryRepository: JuryRepository,
    private readonly criteriaRepository: CriteriaRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly participationRepository: ParticipationRepository,
    private readonly evaluationRepository: EvaluationRepository,
  ) {}

  async create(
    creatorId: string,
    dto: CreateHackathonDTO,
  ): Promise<FullHackathon> {
    return this.hackathonRepository.create({ ...dto, creatorId });
  }

  async getAll(): Promise<FullHackathon[]> {
    return this.hackathonRepository.getAll();
  }

  async getById(id: string): Promise<FullHackathon> {
    return this.hackathonRepository.getById(id);
  }

  async getBySlug(slug: string): Promise<FullHackathon> {
    return this.hackathonRepository.getBySlug(slug);
  }

  async update(id: string, dto: UpdateHackathonDTO): Promise<FullHackathon> {
    return this.hackathonRepository.updateById(id, dto);
  }

  async updateStatus(
    id: string,
    status: HackathonStatus,
  ): Promise<FullHackathon> {
    return this.hackathonRepository.updateById(id, { status });
  }

  async deleteById(id: string): Promise<void> {
    return this.hackathonRepository.deleteById(id);
  }

  async addJuryMember(hackathonId: string, userId: string): Promise<void> {
    await this.juryRepository.add(hackathonId, userId);
  }

  async removeJuryMember(hackathonId: string, userId: string): Promise<void> {
    await this.juryRepository.remove(hackathonId, userId);
  }

  async setCriteria(
    hackathonId: string,
    criteria: CriterionDTO[],
  ): Promise<void> {
    const totalWeight = criteria.reduce((acc, c) => acc + c.weight, 0);
    if (totalWeight !== 100) {
      throw new BadRequestException(
        'Total weight of criteria must be exactly 100%',
      );
    }
    await this.criteriaRepository.syncCriteria(hackathonId, criteria);
  }

  async setCategories(
    hackathonId: string,
    categories: string[],
  ): Promise<void> {
    await this.categoryRepository.syncHackathonCategories(
      hackathonId,
      categories,
    );
  }

  async findUserRegistration(
    hackathonId: string,
    userId: string,
  ): Promise<ParticipationWithTeam> {
    return this.participationRepository.findUserParticipation(
      hackathonId,
      userId,
    );
  }

  async registerTeam(
    hackathonId: string,
    teamId: string,
    userId: string,
  ): Promise<void> {
    const hackathon = await this.hackathonRepository.getById(hackathonId);
    if (!hackathon) throw new NotFoundException('Hackathon not found');
    if (hackathon.status !== HackathonStatus.REGISTRATION) {
      throw new BadRequestException('Registration is not open for this event');
    }

    const existingParticipation =
      await this.participationRepository.findByTeamAndHackathon(
        hackathonId,
        teamId,
      );
    if (existingParticipation) {
      throw new BadRequestException(
        'This team is already registered for this hackathon',
      );
    }
    const userReg = await this.participationRepository.findUserParticipation(
      hackathonId,
      userId,
    );
    if (userReg) {
      throw new BadRequestException(
        'You are already participating in this hackathon with another team',
      );
    }

    await this.participationRepository.create(hackathonId, teamId);
  }

  async submitProject(
    hackathonId: string,
    userId: string,
    dto: SubmitProjectDto,
  ): Promise<void> {
    const hackathon = await this.hackathonRepository.getById(hackathonId);
    if (!hackathon) throw new NotFoundException('Hackathon not found');

    if (hackathon.status !== HackathonStatus.ACTIVE) {
      throw new BadRequestException(
        'Submissions are only allowed for active hackathons',
      );
    }

    if (new Date() > new Date(hackathon.submissionDeadline)) {
      throw new BadRequestException('The submission deadline has passed');
    }

    const participation =
      await this.participationRepository.findUserParticipation(
        hackathonId,
        userId,
      );

    await this.participationRepository.updateSubmission(
      hackathonId,
      participation.teamId,
      dto,
    );
  }

  async getHackathonSubmissionsForJury(
    hackathonId: string,
  ): Promise<ParticipationWithTeam[]> {
    return this.participationRepository.findAllSubmissionsByHackathonId(
      hackathonId,
    );
  }

  async getLeaderboard(id: string): Promise<LeaderboardRow[]> {
    return this.participationRepository.getLeaderboardData(id);
  }

  async setTeamScores(
    userId: string,
    hackathonId: string,
    participationId: string,
    scores: Record<string, number>,
  ): Promise<void> {
    const jury = await this.juryRepository.getJuryByUserAndHackathon(userId, hackathonId);

    await this.evaluationRepository.upsertScores(
      jury.id,
      participationId,
      scores,
    );

    await this.evaluationRepository.recalculateProjectFinalScore(
      participationId,
      hackathonId,
    );
  }

  async setTeamComment(
    userId: string,
    hackathonId: string,
    participationId: string,
    text: string,
  ): Promise<void> {
    const jury = await this.juryRepository.getJuryByUserAndHackathon(
      userId,
      hackathonId,
    );
    await this.evaluationRepository.upsertComment(
      jury.id,
      participationId,
      text,
    );
  }
}
