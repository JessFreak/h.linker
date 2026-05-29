import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TeamService } from '../../services/team.service';
import { UserService } from '../../services/user.service';
import { MatTooltip } from '@angular/material/tooltip';
import { HackathonService } from '../../services/hackathon.service';
import { NotificationService } from '../../utils/notification.service';

interface PagedStatsResponse {
  meta?: { itemCount: number };
  teams?: unknown[];
  users?: unknown[];
  hackathons?: unknown[];
}

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    MatTooltip,
  ],
  templateUrl: 'main-page.component.html',
  styleUrls: ['./main-page.components.scss'],
})
export class MainPageComponent implements OnInit {
  private teamService = inject(TeamService);
  private userService = inject(UserService);
  private hackathonService = inject(HackathonService);
  private notificationService = inject(NotificationService);

  studentsCount = signal<number>(0);
  teamsCount = signal<number>(0);
  hackathonsCount = signal<number>(0);

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    const queryParams = { take: 1 } as unknown;

    this.teamService
      .getAll(queryParams as Parameters<TeamService['getAll']>[0])
      .subscribe({
        next: (res: unknown) => {
          const response = res as PagedStatsResponse;
          this.teamsCount.set(
            response.meta?.itemCount ?? response.teams?.length ?? 0,
          );
        },
        error: () =>
          this.notificationService.error('Failed to load teams count'),
      });

    this.userService
      .getAll(queryParams as Parameters<UserService['getAll']>[0])
      .subscribe({
        next: (res: unknown) => {
          const response = res as PagedStatsResponse;
          this.studentsCount.set(
            response.meta?.itemCount ?? response.users?.length ?? 0,
          );
        },
        error: () =>
          this.notificationService.error('Failed to load users count'),
      });

    this.hackathonService
      .getAll(queryParams as Parameters<HackathonService['getAll']>[0])
      .subscribe({
        next: (res: unknown) => {
          const response = res as PagedStatsResponse;
          this.hackathonsCount.set(
            response.meta?.itemCount ?? response.hackathons?.length ?? 0,
          );
        },
        error: () =>
          this.notificationService.error('Failed to load hackathons count'),
      });
  }
}
