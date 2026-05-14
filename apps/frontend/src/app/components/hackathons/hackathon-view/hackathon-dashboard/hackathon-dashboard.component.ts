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
import {
  FullHackathonResponse,
  TeamResponse,
  UserRegistrationStatusResponse,
} from '@h.linker/libs';
import { Subscription } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TeamMembersListComponent } from '../../../teams/team-details/team-members-list.component';
import { HackathonWeightPreviewComponent } from '../../hackathon-weight-preview.component';
import {
  CountdownService,
  TimeLeft,
} from '../../../../services/countdown.service';

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

  currentUser = toSignal(this.authService.user$);
  hackathon = signal<FullHackathonResponse | null>(null);
  registration = signal<UserRegistrationStatusResponse | null>(null);
  teamDetails = signal<TeamResponse | null>(null);

  timeLeft = signal<TimeLeft>({ days: 0, hrs: 0, min: 0, sec: 0 });
  private timerSub?: Subscription;

  leaderboard = signal([
    { rank: 1, name: 'Team Nova', score: 94.2, isCurrent: false },
    { rank: 2, name: 'Team Horizon', score: 91.7, isCurrent: false },
    { rank: 12, name: 'Dream Team', score: 74.5, isCurrent: true },
    { rank: 13, name: 'Atlas Code', score: 72.1, isCurrent: false },
  ]);

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

  private loadDashboardData(slug: string) {
    this.hackathonService.getBySlug(slug).subscribe((h) => {
      this.hackathon.set(h);
      const { timeLeft, sub } = this.countdownService.start(
        new Date(h.submissionDeadline),
      );
      this.timeLeft = timeLeft;
      this.timerSub = sub;

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
