import { Component, inject } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  template: `
    <h2 mat-dialog-title>Create New Team</h2>
    <mat-dialog-content [formGroup]="form">
      <mat-form-field appearance="outline">
        <mat-label>Team Name</mat-label>
        <input matInput formControlName="name" placeholder="e.g. Dream Team" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Description</mat-label>
        <textarea
          matInput
          formControlName="description"
          placeholder="What is your team about?"
        ></textarea>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Communication Link</mat-label>
        <input
          matInput
          formControlName="communicationLink"
          placeholder="Telegram, Discord, etc."
        />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="form.invalid"
        (click)="onSubmit()"
      >
        Create
      </button>
    </mat-dialog-actions>
  `,
})
export class CreateTeamDialogComponent {
  private fb = inject(NonNullableFormBuilder);
  private dialogRef = inject(MatDialogRef<CreateTeamDialogComponent>);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    communicationLink: [''],
  });

  onCancel() {
    this.dialogRef.close();
  }
  onSubmit() {
    this.dialogRef.close(this.form.value);
  }
}
