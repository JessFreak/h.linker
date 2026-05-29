import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../notification.service';

type ErrorHandlerAction = (
  notify: NotificationService,
  router: Router,
  message: string,
) => void;

const ERROR_HANDLERS: Record<number, ErrorHandlerAction> = {
  0: (notify) =>
    notify.error(
      'Network error. Please check your connection or server status.',
    ),

  400: (notify, _, msg) => notify.error(msg),
  422: (notify, _, msg) => notify.error(msg),

  401: (notify, router) => {
    notify.error('Session expired or unauthorized. Please log in again.');
    router.navigate(['/login']);
  },

  403: (notify) =>
    notify.error('You do not have permission to perform this action.'),

  404: (_, router, msg) =>
    router.navigate(['/404'], { state: { backendError: msg } }),

  500: (notify) =>
    notify.error('Server encountered an error. Please try again later.'),
  502: (notify) =>
    notify.error('Server encountered an error. Please try again later.'),
  503: (notify) =>
    notify.error('Server encountered an error. Please try again later.'),
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const { message: rawMessage, error: errTitle } = error.error ?? {};
      const parsedMessage = Array.isArray(rawMessage)
        ? rawMessage.join('; ')
        : (rawMessage ?? errTitle ?? 'Something went wrong');

      const handler = ERROR_HANDLERS[error.status];

      if (handler) {
        handler(notify, router, parsedMessage);
      } else {
        notify.error(parsedMessage);
      }

      return throwError(() => error);
    }),
  );
};
