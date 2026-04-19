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
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TeamResponse, RoleResponse } from '@h.linker/libs';
import { forkJoin } from 'rxjs';
import { TeamService } from '../../../../services/team.service';
import { RoleService } from '../../../../services/role.service';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-invite-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatInput,
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
