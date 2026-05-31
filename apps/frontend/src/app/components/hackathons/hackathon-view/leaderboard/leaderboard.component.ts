import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Meta, Title } from '@angular/platform-browser';
import { FullHackathonResponse, LeaderboardItem } from '@h.linker/libs';
import { HackathonService } from '../../../../services/hackathon.service';
import { BreadcrumbComponent } from '../../../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    BreadcrumbComponent,
  ],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly hackathonService = inject(HackathonService);

  private readonly metaService = inject(Meta);
  private readonly titleService = inject(Title);

  hackathon = signal<FullHackathonResponse | null>(null);
  leaderboard = signal<LeaderboardItem[]>([]);
  isLoading = signal(true);

  podiumTeams = computed(() => {
    const list = this.leaderboard();
    if (list.length === 0) return [];

    const top3 = list.slice(0, 3);
    const result = [];
    if (top3[1]) result.push(top3[1]);
    if (top3[0]) result.push(top3[0]);
    if (top3[2]) result.push(top3[2]);
    return result.length ? result : top3;
  });

  remainingTeams = computed(() => this.leaderboard().slice(3));

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadLeaderboardData(slug);
    }
  }

  private loadLeaderboardData(slug: string) {
    this.hackathonService.getBySlug(slug).subscribe({
      next: (h) => {
        this.hackathon.set(h);
        this.titleService.setTitle(`${h.title} - Leaderboard | h.linker`);
        this.metaService.updateTag({
          name: 'description',
          content: `Live leaderboard and standings for the ${h.title} hackathon. See the top teams, their scores, and competition results.`,
        });

        this.hackathonService.getLeaderboard(h.id).subscribe({
          next: (res) => {
            this.leaderboard.set(res.leaderboard);
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false),
        });
      },
      error: () => this.isLoading.set(false),
    });
  }
}
