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
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { TeamService } from '../../../../services/team.service';
import { TeamResponse } from '@h.linker/libs';
import { NotificationService } from '../../../../utils/notification.service';

@Component({
  selector: 'app-hackathon-register-dialog',
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
    RouterLink,
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
    `,
  ],
  templateUrl: './hackathon-register-dialog.component.html',
})
export class HackathonRegisterDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private teamService = inject(TeamService);
  private dialogRef = inject(MatDialogRef<HackathonRegisterDialogComponent>);
  private notify = inject(NotificationService);
  data = inject(MAT_DIALOG_DATA);

  myTeams = signal<TeamResponse[]>([]);
  isLoading = signal(true);

  registerForm = this.fb.group({
    teamId: ['', Validators.required],
  });

  ngOnInit() {
    this.teamService
      .getAll({ leaderId: this.data.currentUserId, take: 100 })
      .subscribe({
        next: (res) => {
          this.myTeams.set(res.data);
          this.isLoading.set(false);
        },
        error: () => {
          this.notify.error('Failed to load your teams.');
          this.isLoading.set(false);
        },
      });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.dialogRef.close(this.registerForm.value.teamId);
    }
  }

  onClose() {
    this.dialogRef.close();
  }
}
