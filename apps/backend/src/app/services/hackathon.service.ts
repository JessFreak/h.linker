import { Injectable } from '@nestjs/common';
import { HackathonRepository } from '../database/repositories/hackathon.repository';
import {
  CreateHackathonDTO,
  HackathonStatus,
  UpdateHackathonDTO,
} from '@h.linker/libs';

@Injectable()
export class HackathonService {
  constructor(
    private readonly hackathonRepository: HackathonRepository,
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
}
