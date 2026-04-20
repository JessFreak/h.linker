import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
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
    ReactiveFormsModule,
  ],
  template: `
    <h2 mat-dialog-title>Transfer Team Ownership</h2>
    <mat-dialog-content>
      <p>
        Select a member to become the new leader. You will lose administrative
        rights.
      </p>
      <mat-form-field appearance="outline" class="w-100">
        <mat-label>New Leader</mat-label>
        <mat-select [formControl]="userControl">
          @for (user of data.members; track user.id) {
            <mat-option [value]="user.id">{{ user.username }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-flat-button
        color="warn"
        [disabled]="userControl.invalid"
        [mat-dialog-close]="userControl.value"
      >
        Transfer
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
}
