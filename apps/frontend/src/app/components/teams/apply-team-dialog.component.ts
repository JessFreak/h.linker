import { Component, inject, OnInit, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { RoleService } from '../../services/role.service';
import { RoleResponse } from '@h.linker/libs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  template: `
    <div class="dialog-header">
      <mat-icon class="header-icon">send</mat-icon>
      <h2 mat-dialog-title style="margin: 0;">Join "{{ data.teamName }}"</h2>
    </div>

    <mat-dialog-content [formGroup]="form">
      <p class="h-text-secondary">
        Choose your role and write a short message to the team leader.
      </p>

      <mat-form-field appearance="outline">
        <mat-label>Select Desired Role</mat-label>
        <mat-select formControlName="roleName">
          @for (role of roles(); track role.name) {
            <mat-option [value]="role.name">
              {{ role.name }}
            </mat-option>
          }
        </mat-select>
        <mat-icon matSuffix style="opacity: 0.5">work</mat-icon>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Introduction Message</mat-label>
        <textarea
          matInput
          formControlName="message"
          rows="4"
          placeholder="Tell the leader why you're a good fit..."
        ></textarea>
        <mat-icon matSuffix style="opacity: 0.5">chat_bubble</mat-icon>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button
        mat-flat-button
        color="accent"
        [disabled]="form.invalid"
        (click)="onSubmit()"
      >
        <mat-icon>check</mat-icon>
        Send Request
      </button>
    </mat-dialog-actions>
  `,
})
export class ApplyTeamDialogComponent implements OnInit {
  public data = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<ApplyTeamDialogComponent>);
  private roleService = inject(RoleService);
  private fb = inject(NonNullableFormBuilder);

  roles = signal<RoleResponse[]>([]);

  form = this.fb.group({
    roleName: ['', [Validators.required]],
    message: [''],
  });

  ngOnInit() {
    this.roleService.getAll().subscribe((res) => this.roles.set(res.roles));
  }

  onCancel() {
    this.dialogRef.close();
  }
  onSubmit() {
    this.dialogRef.close(this.form.value);
  }
}
