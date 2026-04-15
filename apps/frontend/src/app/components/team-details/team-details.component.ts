import { Component, inject, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TeamService } from '../../services/team.service';
import AuthService from '../../services/auth.service';
import { TeamResponse } from '@h.linker/libs';

@Component({
  selector: 'app-team-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './team-details.component.html',
  styleUrls: ['./team-details.component.scss'],
})
export class TeamDetailsComponent {
  private teamService = inject(TeamService);
  private authService = inject(AuthService);

  @Input() set id(teamId: string) {
    this.loadTeam(teamId);
  }

  team = signal<TeamResponse | null>(null);
  currentUser = toSignal(this.authService.user$);

  loadTeam(id: string) {
    this.teamService.getById(id).subscribe((res) => this.team.set(res));
  }

  isLeader = () => this.team()?.leaderId === this.currentUser()?.id;

  openChat() {
    const link = this.team()?.communicationLink;
    if (link) window.open(link, '_blank');
  }
}
