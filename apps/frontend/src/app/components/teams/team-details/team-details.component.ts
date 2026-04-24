import { Component, inject, Input, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TeamService } from '../../../services/team.service';
import AuthService from '../../../services/auth.service';
import { TeamResponse } from '@h.linker/libs';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../../utils/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../utils/confirm-dialog.component';
import { TeamUtils } from '../../../utils/team.utils';
import { TeamActionsService } from '../../../utils/team-actions.service';
import { MatTooltip } from '@angular/material/tooltip';

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
    MatTooltip,
  ],
  templateUrl: './team-details.component.html',
  styleUrls: ['./team-details.component.scss', '../.rejected.scss'],
})
class TeamDetailsComponent {
  private readonly teamService = inject(TeamService);
  private readonly authService = inject(AuthService);
  private readonly notify = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly teamActions = inject(TeamActionsService);
  private readonly router = inject(Router);

  @Input() set id(teamId: string) {
    this.loadTeam(teamId);
  }

  team = signal<TeamResponse | null>(null);
  currentUser = toSignal(this.authService.user$);

  loadTeam(id: string) {
    this.teamService.getById(id).subscribe((res) => this.team.set(res));
  }

  isMember(): boolean {
    return TeamUtils.isMember(this.team(), this.currentUser()?.id);
  }

  hasRequest(): boolean {
    return TeamUtils.hasPendingRequest(this.team(), this.currentUser()?.id);
  }

  isLeader(): boolean {
    return TeamUtils.isLeader(this.team(), this.currentUser()?.id);
  }

  isRejected(): boolean {
    console.log(this.team());
    return TeamUtils.isRejected(this.team(), this.currentUser()?.id);
  }

  openApplyDialog() {
    const user = this.currentUser();
    const team = this.team();

    if (!user) {
      this.notify.info('Please login or register first to join the team');
      this.router.navigate(['/login']);
      return;
    }

    if (!team) return;

    this.teamActions.openApplyDialog(team, () => this.loadTeam(team.id));
  }

  onLeaveTeam() {
    const currentTeam = this.team();
    if (!currentTeam) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
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
