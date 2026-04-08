import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const isInternalApi =
    req.url.includes('/api') && !req.url.includes('imgbb.com');

  if (isInternalApi) {
    req = req.clone({
      withCredentials: true,
    });
  }
  return next(req);
};
