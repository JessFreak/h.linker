import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title style="color: #f44336;">Delete Account</h2>
    <mat-dialog-content style="color: rgba(255,255,255,0.7);">
      Are you sure you want to delete your account? This action is permanent and
      all your data (skills, integrations, bio) will be lost forever.
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">
        Yes, Delete
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDeleteDialogComponent {}
