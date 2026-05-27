import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { ShowcaseProjectResponse } from '@h.linker/libs';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-project-showcase',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './project-showcase.component.html',
  styleUrls: ['./project-showcase.component.scss'],
})
export class ProjectShowcaseComponent implements OnInit {
  private projectService = inject(ProjectService);

  projects = signal<ShowcaseProjectResponse[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadShowcase();
  }

  private loadShowcase() {
    this.projectService.getShowcase().subscribe({
      next: (res) => {
        this.projects.set(res.projects);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load showcase', err);
        this.isLoading.set(false);
      },
    });
  }

  getRankClass(index: number): string {
    if (index === 0) return 'rank-1';
    if (index === 1) return 'rank-2';
    if (index === 2) return 'rank-3';
    return 'rank-default';
  }
}
