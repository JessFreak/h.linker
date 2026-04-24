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
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  template: `
    <div mat-dialog-title class="dialog-header">
      <mat-icon class="header-icon">groups</mat-icon>
      <h2>Create New Team</h2>
    </div>

    <mat-dialog-content [formGroup]="form">
      <p class="h-text-secondary">
        Start a new project and invite your friends.
      </p>

      <mat-form-field appearance="outline">
        <mat-label>Team Name</mat-label>
        <input matInput formControlName="name" placeholder="e.g. Dream Team" />
        <mat-icon matSuffix color="primary">badge</mat-icon>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Description</mat-label>
        <textarea
          matInput
          formControlName="description"
          placeholder="What is your team about?"
          rows="3"
        ></textarea>
        <mat-icon matSuffix style="opacity: 0.5">description</mat-icon>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Communication Link</mat-label>
        <input
          matInput
          formControlName="communicationLink"
          placeholder="Telegram, Discord, etc."
        />
        <mat-icon matSuffix style="opacity: 0.5">link</mat-icon>
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
        <mat-icon>add</mat-icon>
        Create Team
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
