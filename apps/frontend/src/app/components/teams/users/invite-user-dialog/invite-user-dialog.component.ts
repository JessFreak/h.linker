import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TeamResponse, RoleResponse } from '@h.linker/libs';
import { forkJoin } from 'rxjs';
import { TeamService } from '../../../../services/team.service';
import { RoleService } from '../../../../services/role.service';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-invite-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatInputModule,
  ],
  styles: [
    `
      .loading-container,
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 0;
        gap: 16px;
        text-align: center;
      }

      .invite-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding-top: 8px;
      }

      .empty-state mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        opacity: 0.5;
      }
    `,
  ],
  templateUrl: './invite-user-dialog.component.html',
})
export class InviteUserDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private teamService = inject(TeamService);
  private roleService = inject(RoleService);
  private dialogRef = inject(MatDialogRef<InviteUserDialogComponent>);
  data = inject(MAT_DIALOG_DATA);

  myTeams = signal<TeamResponse[]>([]);
  roles = signal<RoleResponse[]>([]);
  isLoading = signal(true);

  inviteForm = this.fb.group({
    teamId: ['', Validators.required],
    roleName: ['', Validators.required],
    message: [''],
  });

  ngOnInit() {
    forkJoin({
      teams: this.teamService.getAll(this.data.currentUserId),
      roles: this.roleService.getAll(),
    }).subscribe({
      next: (res) => {
        this.myTeams.set(res.teams.teams);
        this.roles.set(res.roles.roles);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  onSubmit() {
    if (this.inviteForm.valid) {
      this.dialogRef.close(this.inviteForm.value);
    }
  }
}
