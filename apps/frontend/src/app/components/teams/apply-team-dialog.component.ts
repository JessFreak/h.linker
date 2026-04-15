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

@Component({
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  styles: [
    `
      mat-dialog-content {
        display: flex;
        flex-direction: column;
        gap: 20px;
        min-width: 400px; 
        padding-top: 16px !important;
      }

      mat-form-field {
        width: 100%;
      }

      .h-text-secondary {
        margin-bottom: 8px;
      }
    `,
  ],
  template: `
    <h2 mat-dialog-title>Apply to Team "{{ data.teamName }}"</h2>
    <mat-dialog-content [formGroup]="form">
      <p class="h-text-secondary">
        Choose your role and write a short message to the team leader.
      </p>

      <mat-form-field appearance="outline">
        <mat-label>Select Role</mat-label>
        <mat-select formControlName="roleName">
          @for (role of roles(); track role.name) {
            <mat-option [value]="role.name">{{ role.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Message (Optional)</mat-label>
        <textarea
          matInput
          formControlName="message"
          rows="4"
          placeholder="Tell the leader why you're a good fit..."
        ></textarea>
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
