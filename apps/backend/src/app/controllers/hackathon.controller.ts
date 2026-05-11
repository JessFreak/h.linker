import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Put,
  Body,
} from '@nestjs/common';
import { Access } from '../../config/security/decorators/access';

@Controller('hackathons')
export class HackathonController {
  @Get()
  async getAll() {
    // Повертає список усіх хакатонів (фільтрація за статусом на сервісі)
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    // Детальна інфа про хакатон
  }

  @Get(':id/leaderboard')
  async getLeaderboard(@Param('id') id: string) {
    // Таблиця результатів: Команда -> Сума балів
  }

  // --- ADMIN API (Творець хакатону) ---

  @Post()
  @Access('ADMIN') // Або твій варіант перевірки ролі
  async create(@Body() dto: any) {
    // CreateHackathonDto: title, description, startDate, endDate, prizeFund
  }

  @Patch(':id')
  @Access('ADMIN')
  async update(@Param('id') id: string, @Body() dto: any) {
    // UpdateHackathonDto: будь-які поля з CreateHackathonDto (часткове оновлення)
  }

  @Patch(':id/status')
  @Access('ADMIN')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    // Зміна етапів: REGISTRATION -> ONGOING -> JUDGING -> CLOSED
  }

  @Put(':id/criteria')
  @Access('ADMIN')
  async setCriteria(@Param('id') id: string, @Body() criteria: any[]) {
    // Встановлення критеріїв оцінки (назва, вага/макс_бал)
  }

  @Put(':id/jury')
  @Access('ADMIN')
  async setJury(@Param('id') id: string, @Body('userIds') userIds: string[]) {
    // Призначення списку жюрі для хакатону
  }

  @Delete(':id')
  @Access('ADMIN')
  async remove(@Param('id') id: string) {
    // Видалення хакатону (Danger zone)
  }

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
