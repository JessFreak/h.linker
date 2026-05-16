import {
  Component,
  OnInit,
  inject,
  signal,
  OnDestroy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router'; // Додав Router сюди
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HackathonService } from '../../../services/hackathon.service';
import {
  FullHackathonResponse,
  HackathonStatus,
  UserRegistrationStatusResponse,
} from '@h.linker/libs';
import { Subscription } from 'rxjs';
import { HackathonWeightPreviewComponent } from '../hackathon-weight-preview.component';
import { HackathonTimelineComponent } from '../hackathon-timeline/hackathon-timeline.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../services/auth.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NotificationService } from '../../../utils/notification.service';
import { HackathonRegisterDialogComponent } from './hackathon-register-dialog/hackathon-register-dialog.component';
import {
  CountdownService,
  TimeLeft,
} from '../../../services/countdown.service';

@Component({
  selector: 'app-hackathon-view',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    RouterLink,
    HackathonWeightPreviewComponent,
    HackathonTimelineComponent,
    MatDialogModule,
  ],
  templateUrl: './hackathon-view.component.html',
  styleUrls: ['./hackathon-view.component.scss'],
})
export class HackathonViewComponent implements OnInit, OnDestroy {
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private hackathonService = inject(HackathonService);
  private authService = inject(AuthService);
  private countdownService = inject(CountdownService);

  currentUser = toSignal(this.authService.user$);
  hackathon = signal<FullHackathonResponse | null>(null);
  userRegistration = signal<UserRegistrationStatusResponse | null>(null);
  timeLeft = signal<TimeLeft>({ days: 0, hrs: 0, min: 0, sec: 0 });
  private timerSub?: Subscription;

  readonly Status = HackathonStatus;

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadHackathon(slug);
    }
  }

  private loadHackathon(slug: string) {
    this.hackathonService.getBySlug(slug).subscribe((res) => {
      this.hackathon.set(res);

      if (this.currentUser()) {
        this.checkRegistration(res.id);
      }

      if (
        res.status === HackathonStatus.REGISTRATION ||
        res.status === HackathonStatus.DRAFT
      ) {
        const { timeLeft, sub } = this.countdownService.start(
          new Date(res.startDate),
          60000,
        );
        this.timeLeft = timeLeft;
        this.timerSub = sub;
      }
    });
  }

  private checkRegistration(id: string) {
    this.hackathonService.getRegistrationStatus(id).subscribe({
      next: (status) => this.userRegistration.set(status),
      error: () => this.userRegistration.set(null),
    });
  }

  isCreator = computed(() => {
    const user = this.currentUser();
    const h = this.hackathon();
    return !!user && !!h && user.id === h.creator.id;
  });

  isJury = computed(() => {
    const user = this.currentUser();
    const h = this.hackathon();
    if (!user || !h || !h.jury) return false;

    return h.jury.some((j) => j.userId === user.id);
  });

  onRegister() {
    const h = this.hackathon();
    const user = this.currentUser();

    if (!user) {
      this.notificationService.info('Please sign in to register for the event');
      this.router.navigate(['/login']);
      return;
    }

    const dialogRef = this.dialog.open(HackathonRegisterDialogComponent, {
      width: '450px',
      data: {
        hackathonName: h?.title,
        currentUserId: user.id,
      },
    });

    dialogRef.afterClosed().subscribe((teamId) => {
      if (teamId && h) {
        this.hackathonService.registerTeam(h.id, teamId).subscribe({
          next: () => {
            this.notificationService.success('Team registered successfully!');
            this.checkRegistration(h.id);
            this.loadHackathon(h.slug);
          },
          error: (err) => {
            this.notificationService.error(
              err.error?.message || 'Registration failed',
            );
          },
        });
      }
    });
  }

  ngOnDestroy() {
    this.timerSub?.unsubscribe();
  }
}
