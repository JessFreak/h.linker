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
import { ApplyTeamDialogComponent } from './apply-team-dialog.component';
import { RouterLink } from '@angular/router';

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
  ],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'],
})
export class TeamsComponent implements OnInit {
  private teamService = inject(TeamService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

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
        this.teamService.create(result).subscribe(() => this.loadTeams());
      }
    });
  }

  openApplyDialog(team: TeamResponse) {
    const user = this.currentUser();
    if (!user) return;

    const dialogRef = this.dialog.open(ApplyTeamDialogComponent, {
      width: '500px',
      data: { teamName: team.name },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const dto = {
          userId: user.id,
          roleName: result.roleName,
          message: result.message,
          type: 'REQUEST' as const,
        };

        this.teamService.addMember(team.id, dto).subscribe(() => {
          this.loadTeams();
        });
      }
    });
  }

  isMember(team: TeamResponse): boolean {
    const user = this.currentUser();
    return !!team.members?.some((m) => m.id === user?.id);
  }
}
