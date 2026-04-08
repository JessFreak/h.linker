import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const { message: rawMessage, error: errTitle } = error.error ?? {};

      const message = Array.isArray(rawMessage)
        ? rawMessage.join('; ')
        : (rawMessage ?? errTitle ?? 'Something went wrong');

      notify.error(message);

      return throwError(() => error);
    }),
  );
};
