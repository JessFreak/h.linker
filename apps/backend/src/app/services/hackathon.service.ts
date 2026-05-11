import { BadRequestException, Injectable } from '@nestjs/common';
import { HackathonRepository } from '../database/repositories/hackathon.repository';
import {
  CreateHackathonDTO,
  CriterionDTO,
  HackathonStatus,
  UpdateHackathonDTO,
} from '@h.linker/libs';
import { JuryRepository } from '../database/repositories/jury.repository';
import { CriteriaRepository } from './criteria.repository';
import { CategoryRepository } from '../database/repositories/category.repository';

@Injectable()
export class HackathonService {
  constructor(
    private readonly hackathonRepository: HackathonRepository,
    private readonly juryRepository: JuryRepository,
    private readonly criteriaRepository: CriteriaRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async create(creatorId: string, dto: CreateHackathonDTO) {
    return this.hackathonRepository.create({ ...dto, creatorId });
  }

  async getAll() {
    return this.hackathonRepository.getAll();
  }

  async getById(id: string) {
    return this.hackathonRepository.getById(id);
  }

  async update(id: string, dto: UpdateHackathonDTO) {
    return this.hackathonRepository.updateById(id, dto);
  }

  async updateStatus(id: string, status: HackathonStatus) {
    return this.hackathonRepository.updateById(id, { status });
  }

  async deleteById(id: string): Promise<void> {
    return this.hackathonRepository.deleteById(id);
  }

  async addJuryMember(hackathonId: string, userId: string) {
    return this.juryRepository.add(hackathonId, userId);
  }

  async removeJuryMember(hackathonId: string, userId: string) {
    return this.juryRepository.remove(hackathonId, userId);
  }

  async setCriteria(hackathonId: string, criteria: CriterionDTO[]) {
    const totalWeight = criteria.reduce((acc, c) => acc + c.weight, 0);
    if (totalWeight !== 100) {
      throw new BadRequestException('Total weight must be 100%');
    }
    return this.criteriaRepository.syncCriteria(hackathonId, criteria);
  }

  async setCategories(hackathonId: string, categories: string[]) {
    return this.categoryRepository.syncHackathonCategories(
      hackathonId,
      categories,
    );
  }
}
