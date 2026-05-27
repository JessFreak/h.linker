import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { HackathonService } from '../../../../services/hackathon.service';
import { TeamService } from '../../../../services/team.service';
import { AuthService } from '../../../../services/auth.service';
import { NotificationService } from '../../../../utils/notification.service';
import {
  FullHackathonResponse,
  TeamResponse,
  UserRegistrationStatusResponse,
  LeaderboardItem,
  TeamReviewResponse,
  TeamReviewsResponse,
} from '@h.linker/libs';
import { Subscription } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TeamMembersListComponent } from '../../../teams/team-details/team-members-list.component';
import { HackathonWeightPreviewComponent } from '../../hackathon-weight-preview.component';
import {
  CountdownService,
  TimeLeft,
} from '../../../../services/countdown.service';
import { BreadcrumbComponent } from '../../../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-hackathon-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
    RouterLink,
    MatCardModule,
    TeamMembersListComponent,
    HackathonWeightPreviewComponent,
    BreadcrumbComponent,
  ],
  templateUrl: './hackathon-dashboard.component.html',
  styleUrls: ['./hackathon-dashboard.component.scss'],
})
export class HackathonDashboardComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private hackathonService = inject(HackathonService);
  private teamService = inject(TeamService);
  private authService = inject(AuthService);
  private countdownService = inject(CountdownService);
  private notificationService = inject(NotificationService);

  currentUser = toSignal(this.authService.user$);
  hackathon = signal<FullHackathonResponse | null>(null);
  registration = signal<UserRegistrationStatusResponse | null>(null);
  teamDetails = signal<TeamResponse | null>(null);

  timeLeft = signal<TimeLeft>({ days: 0, hrs: 0, min: 0, sec: 0 });
  private timerSub?: Subscription;

  isTimeUp = computed(() => {
    const t = this.timeLeft();
    return t.days === 0 && t.hrs === 0 && t.min === 0 && t.sec === 0;
  });

  leaderboardItems = signal<LeaderboardItem[]>([]);

  teamReviews = signal<TeamReviewResponse[]>([]);
  activeReviewIndex = signal<number>(0);

  currentReview = computed(() => {
    const reviews = this.teamReviews();
    return reviews.length > 0 ? reviews[this.activeReviewIndex()] : null;
  });

  currentRank = computed(() => {
    const myTeamId = this.teamDetails()?.id;
    if (!myTeamId || this.leaderboardItems().length === 0) return null;

    const found = this.leaderboardItems().find(
      (item) => item.teamId === myTeamId,
    );
    return found ? found.rank : null;
  });

  isMyTeamInTop3 = computed(() => {
    const myTeamId = this.teamDetails()?.id;
    if (!myTeamId) return false;
    return this.leaderboardItems()
      .slice(0, 3)
      .some((item) => item.teamId === myTeamId);
  });

  myTeamLeaderboardItem = computed(() => {
    const myTeamId = this.teamDetails()?.id;
    if (!myTeamId) return null;
    return (
      this.leaderboardItems().find((item) => item.teamId === myTeamId) || null
    );
  });

  maxPossibleScore = computed(() => {
    const h = this.hackathon();
    if (!h?.criteria || h.criteria.length === 0) return 10;

    return h.criteria.reduce(
      (acc, c) => acc + c.maxValue * (c.weight / 100),
      0,
    );
  });

  isLeader = computed(() => {
    const user = this.currentUser();
    const team = this.teamDetails();
    return !!user && !!team && team.leaderId === user.id;
  });

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadDashboardData(slug);
    }
  }

  nextReview(): void {
    if (this.activeReviewIndex() < this.teamReviews().length - 1) {
      this.activeReviewIndex.update((idx) => idx + 1);
    }
  }

  prevReview(): void {
    if (this.activeReviewIndex() > 0) {
      this.activeReviewIndex.update((idx) => idx - 1);
    }
  }

  private loadDashboardData(slug: string) {
    this.hackathonService.getBySlug(slug).subscribe((h) => {
      this.hackathon.set(h);
      const { timeLeft, sub } = this.countdownService.start(
        new Date(h.submissionDeadline),
      );
      this.timeLeft = timeLeft;
      this.timerSub = sub;

      if (h.status !== 'ACTIVE') {
        this.notificationService.info(
          `Project submission is locked. Event stage: ${h.status}`,
        );
      }

      this.hackathonService.getLeaderboard(h.id).subscribe((res) => {
        this.leaderboardItems.set(res.leaderboard);
      });

      this.hackathonService.getMySubmissionReviews(h.id).subscribe({
        next: (res: TeamReviewsResponse) => {
          this.teamReviews.set(res.reviews);
        },
        error: () => {
          console.error('Failed to load project reviews from database');
        },
      });

      this.hackathonService.getRegistrationStatus(h.id).subscribe((reg) => {
        if (!reg.isRegistered || !reg.team) {
          this.router.navigate(['/events', slug]);
          return;
        }
        this.registration.set(reg);

        this.teamService.getById(reg.team.id).subscribe((details) => {
          this.teamDetails.set(details);
        });
      });
    });
  }

  ngOnDestroy() {
    this.timerSub?.unsubscribe();
  }
}
