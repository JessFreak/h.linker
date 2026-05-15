import { Component, input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TeamMemberResponse } from '@h.linker/libs';

@Component({
  selector: 'app-team-members-list',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, RouterLink, MatTooltipModule],
  template: `
    <div class="section-label">MEMBERS ({{ members().length || 0 }})</div>
    <div class="members-container">
      @for (member of members(); track member.id) {
        <div class="member-item">
          <div
            class="h-user-redirect-group"
            [routerLink]="['/users', member.username]"
            matTooltip="View profile"
          >
            <img
              [ngSrc]="member.avatarUrl || 'default-avatar.png'"
              [alt]="member.username + ' avatar'"
              width="32"
              height="32"
              class="h-avatar-sm"
            />
            <div class="member-info">
              <span class="h-username-link">{{ member.username }}</span>
              <span class="role-text">{{ member.roleName }}</span>
            </div>
          </div>

          <span
            class="h-badge"
            [class.h-badge-leader]="member.id === leaderId()"
            [matTooltip]="
              member.id === leaderId() ? 'Team Owner' : 'Team Participant'
            "
          >
            {{ member.id === leaderId() ? 'Leader' : 'Member' }}
          </span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .member-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);

        &:last-child {
          border-bottom: none;
        }

        .member-info {
          display: flex;
          flex-direction: column;

          .role-text {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.5);
          }
        }
      }

      .members-container {
        display: flex;
        flex-direction: column;
      }
    `,
  ],
})
export class TeamMembersListComponent {
  members = input<TeamMemberResponse[]>([]);
  leaderId = input<string | undefined>('');
}
