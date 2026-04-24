import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TeamMemberResponse } from '@h.linker/libs';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    ReactiveFormsModule,
  ],
  styles: [
    `
      .dialog-header {
        mat-icon {
          color: var(--h-safety-orange);
        }
      }

      .member-option {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 4px 0;
      }

      .warning-box {
        background: rgba(240, 136, 0, 0.1);
        border-left: 4px solid var(--h-safety-orange);
        padding: 12px;
        margin-bottom: 20px;
        border-radius: 4px;

        p {
          margin: 0;
          font-size: 13px;
          line-height: 1.4;
        }
      }
    `,
  ],
  template: `
    <div mat-dialog-title class="dialog-header">
      <mat-icon class="header-icon">swap_horiz</mat-icon>
      <h2 style="margin: 0;">Transfer Ownership</h2>
    </div>

    <mat-dialog-content>
      <div class="warning-box">
        <p class="h-text-secondary" style="color: #eee !important;">
          <strong>Attention:</strong> Select a member to become the new leader.
          You will lose all administrative rights and become a regular member.
        </p>
      </div>

      <mat-form-field appearance="outline" class="w-100">
        <mat-label>New Leader</mat-label>
        <mat-select
          [formControl]="userControl"
          placeholder="Select future owner"
        >
          <mat-select-trigger>
            {{ getSelectedUsername() }}
          </mat-select-trigger>

          @for (user of data.members; track user.id) {
            <mat-option [value]="user.id">
              <div class="member-option">
                <img
                  [src]="user.avatarUrl || 'default-avatar.png'"
                  width="24"
                  height="24"
                  class="h-avatar"
                  alt="avatar"
                />
                <span>{{ user.username }}</span>
                <small class="h-text-secondary" style="margin-left: auto;">
                  {{ user.roleName }}
                </small>
              </div>
            </mat-option>
          }
        </mat-select>
        <mat-icon matSuffix>stars</mat-icon>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close type="button">Cancel</button>
      <button
        mat-flat-button
        color="warn"
        type="button"
        [disabled]="userControl.invalid"
        [mat-dialog-close]="userControl.value"
        matTooltip="This action is permanent"
      >
        <mat-icon>verified_user</mat-icon>
        Confirm Transfer
      </button>
    </mat-dialog-actions>
  `,
})
export class TransferLeaderDialogComponent {
  readonly data = inject<{ members: TeamMemberResponse[] }>(MAT_DIALOG_DATA);

  userControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  getSelectedUsername(): string {
    const selectedId = this.userControl.value;
    return this.data.members.find((m) => m.id === selectedId)?.username || '';
  }
}
