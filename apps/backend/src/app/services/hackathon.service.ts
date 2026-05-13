import { BadRequestException, Injectable } from '@nestjs/common';
import { HackathonRepository } from '../database/repositories/hackathon.repository';
import {
  CreateHackathonDTO,
  CriterionDTO,
  HackathonStatus,
  UpdateHackathonDTO,
} from '@h.linker/libs';
import { JuryRepository } from '../database/repositories/jury.repository';
import { CriteriaRepository } from '../database/repositories/criteria.repository';
import { CategoryRepository } from '../database/repositories/category.repository';
import { FullHackathon } from '../database/entities/hackathon.entity';

@Injectable()
export class HackathonService {
  constructor(
    private readonly hackathonRepository: HackathonRepository,
    private readonly juryRepository: JuryRepository,
    private readonly criteriaRepository: CriteriaRepository,
    private readonly categoryRepository: CategoryRepository,
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
}
