import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TeamResponse } from '@h.linker/libs';
import { TeamService } from '../services/team.service';
import { NotificationService } from './notification.service';
import { ApplyTeamDialogComponent } from '../components/teams/apply-team-dialog.component';

@Injectable({ providedIn: 'root' })
export class TeamActionsService {
  private dialog = inject(MatDialog);
  private teamService = inject(TeamService);
  private notify = inject(NotificationService);

  openApplyDialog(team: TeamResponse, callback?: () => void) {
    const dialogRef = this.dialog.open(ApplyTeamDialogComponent, {
      width: '500px',
      data: { teamName: team.name },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const dto = {
          roleName: result.roleName,
          message: result.message,
        };

        this.teamService.applyToTeam(team.id, dto).subscribe({
          next: () => {
            this.notify.success(`Request sent to the team ${team.name}`);
            if (callback) callback();
          },
          error: (err) =>
            this.notify.error(err.error?.message || 'Failed to send request'),
        });
      }
    });
  }
}
