import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.open(`✅ ${message}`, 'success-snackbar');
  }

  error(message: string): void {
    this.open(`❌ ${message}`, 'error-snackbar', 8000);
  }

  info(message: string): void {
    this.open(`ℹ️ ${message}`, 'info-snackbar', 4000);
  }

  private open(message: string, panelClass: string, duration = 3000) {
    this.snackBar.open(message, 'OK', {
      duration,
      panelClass: ['h-snackbar', panelClass],
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }
}
