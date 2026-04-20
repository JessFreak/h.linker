import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TeamService } from '../../services/team.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: 'main-page.component.html',
  styleUrls: ['./main-page.components.scss'],
})
export class MainPageComponent implements OnInit {
  private teamService = inject(TeamService);
  private userService = inject(UserService);

  studentsCount = signal<number>(0);
  teamsCount = signal<number>(0);
  hackathonsCount = signal<number>(15);

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.teamService.getAll().subscribe({
      next: (res) => this.teamsCount.set(res.teams?.length || 0),
      error: () => console.error('Failed to load teams count'),
    });

    this.userService.getAll().subscribe({
      next: (res) => this.studentsCount.set(res.users?.length || 0),
      error: () => console.error('Failed to load users count'),
    });
  }
}
