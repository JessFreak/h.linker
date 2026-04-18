import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.snackBar.open(`✅ ${message}`, 'Close', {
      panelClass: ['success-snackbar'],
    });
  }

  error(message: string): void {
    this.snackBar.open(`❌ ${message}`, 'Close', {
      panelClass: ['error-snackbar'],
      duration: 6000,
    });
  }

  info(message: string): void {
    this.snackBar.open(`ℹ️ ${message}`, 'Close', {
      panelClass: ['info-snackbar'],
      duration: 4000,
    });
  }
}
