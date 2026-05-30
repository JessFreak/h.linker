import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TeamService } from '../../services/team.service';
import { UserService } from '../../services/user.service';
import { HackathonService } from '../../services/hackathon.service';
import { ProjectService } from '../../services/project.service'; // Додано
import { MatTooltip } from '@angular/material/tooltip';
import { NotificationService } from '../../utils/notification.service';

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
  private projectService = inject(ProjectService); // Додано
  private notificationService = inject(NotificationService);

  studentsCount = signal<number>(0);
  teamsCount = signal<number>(0);
  hackathonsCount = signal<number>(0);
  projectsCount = signal<number>(0); // Додано

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    const queryParams = { take: 1 };

    this.teamService.getAll(queryParams).subscribe({
      next: (res) => this.teamsCount.set(res.meta.itemCount),
      error: () => this.notificationService.error('Failed to load teams count'),
    });

    this.userService.getAll(queryParams).subscribe({
      next: (res) => this.studentsCount.set(res.meta.itemCount),
      error: () => this.notificationService.error('Failed to load users count'),
    });

    this.hackathonService.getAll(queryParams).subscribe({
      next: (res) => this.hackathonsCount.set(res.meta.itemCount),
      error: () =>
        this.notificationService.error('Failed to load hackathons count'),
    });

    this.projectService.getShowcase(queryParams).subscribe({
      next: (res) => this.projectsCount.set(res.meta.itemCount),
      error: () =>
        this.notificationService.error('Failed to load projects count'),
    });
  }
}
