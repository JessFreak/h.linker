import { Component, computed, inject, Input, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TeamService } from '../../services/team.service';
import AuthService from '../../services/auth.service';
import { TeamResponse } from '@h.linker/libs';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../utils/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../utils/confirm-dialog.component';

@Component({
  selector: 'app-team-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatDividerModule,
    NgOptimizedImage,
    RouterLink,
  ],
  templateUrl: './team-details.component.html',
  styleUrls: ['./team-details.component.scss'],
})
class TeamDetailsComponent {
  private teamService = inject(TeamService);
  private authService = inject(AuthService);
  private notify = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  @Input() set id(teamId: string) {
    this.loadTeam(teamId);
  }

  team = signal<TeamResponse | null>(null);
  currentUser = toSignal(this.authService.user$);

  loadTeam(id: string) {
    this.teamService.getById(id).subscribe((res) => this.team.set(res));
  }

  isMember = computed(() => {
    const user = this.currentUser();
    const team = this.team();
    if (!user || !team) return false;

    return team.members?.some((m) => m.id === user.id);
  });
  isLeader = computed(() => {
    return this.team()?.leaderId === this.currentUser()?.id;
  });

  onLeaveTeam() {
    const currentTeam = this.team();
    if (!currentTeam) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Leave Team',
        message: `Are you sure you want to leave "${currentTeam.name}"? You will need an invite or a new request to join again.`,
        confirmText: 'Leave Team',
        isDanger: true,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.teamService.leave(currentTeam.id).subscribe({
          next: () => {
            this.notify.success('You have left the team');
            this.loadTeam(currentTeam.id);
          },
          error: (err) =>
            this.notify.error(err.error?.message || 'Failed to leave'),
        });
      }
    });
  }

  openChat() {
    const link = this.team()?.communicationLink;
    if (link) window.open(link, '_blank');
  }
}

export default TeamDetailsComponent;
