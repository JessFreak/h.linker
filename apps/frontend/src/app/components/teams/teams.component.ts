import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { TeamResponse } from '@h.linker/libs';
import { CreateTeamDialogComponent } from './create-team-dialog.component';
import { TeamService } from '../../services/team.service';
import AuthService from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../utils/notification.service';
import { TeamUtils } from '../../utils/team.utils';
import { TeamActionsService } from '../../utils/team-actions.service';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    RouterLink,
    MatTooltip,
  ],
  templateUrl: './teams.component.html',
  styleUrls: ['./discovery-shared.scss', './.rejected.scss'],
})
export class TeamsComponent implements OnInit {
  private teamService = inject(TeamService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private notify = inject(NotificationService);
  private teamActions = inject(TeamActionsService);
  private readonly router = inject(Router);

  teams: TeamResponse[] = [];

  currentUser = toSignal(this.authService.user$);

  allTeams = signal<TeamResponse[]>([]);

  showOnlyMyTeams = signal(false);
  showOnlyIAMLeader = signal(false);

  filteredTeams = computed(() => {
    let list = this.allTeams();
    const user = this.currentUser();

    if (this.showOnlyMyTeams()) {
      list = list.filter((t) => t.members?.some((m) => m.id === user?.id));
    }

    if (this.showOnlyIAMLeader()) {
      list = list.filter((t) => t.leaderId === user?.id);
    }

    return list;
  });

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams() {
    this.teamService.getAll().subscribe((res) => {
      const data = res.teams;
      this.allTeams.set(data);
    });
  }

  toggleMyTeams() {
    this.showOnlyMyTeams.set(!this.showOnlyMyTeams());
  }

  toggleLeaderTeams() {
    this.showOnlyIAMLeader.set(!this.showOnlyIAMLeader());
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateTeamDialogComponent, {
      width: '450px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notify.success('Successfully created team');
        this.teamService.create(result).subscribe(() => this.loadTeams());
      }
    });
  }

  openApplyDialog(team: TeamResponse) {
    const user = this.currentUser();
    if (!user) {
      this.notify.info('Please login or register first to join the team');
      this.router.navigate(['/login']);
      return;
    }

    this.teamActions.openApplyDialog(team, () => this.loadTeams());
  }

  isMember(team: TeamResponse): boolean {
    return TeamUtils.isMember(team, this.currentUser()?.id);
  }

  hasRequest(team: TeamResponse): boolean {
    return TeamUtils.hasPendingRequest(team, this.currentUser()?.id);
  }

  isRejected(team: TeamResponse): boolean {
    return TeamUtils.isRejected(team, this.currentUser()?.id);
  }
}
