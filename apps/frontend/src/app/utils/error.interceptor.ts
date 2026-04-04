import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const { message: rawMessage, error: errTitle } = error.error ?? {};

      const message = Array.isArray(rawMessage)
        ? rawMessage.join('; ')
        : (rawMessage ?? errTitle ?? 'Something went wrong');

      snackBar.open(message, 'Close', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar'],
      });

      return throwError(() => error);
    }),
  );
};
