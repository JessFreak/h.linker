import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const isAuthorised = localStorage.getItem('isAuthorised') === 'true';

  if (!isAuthorised) {
    return true;
  }

  return router.parseUrl('/profile/settings');
};
