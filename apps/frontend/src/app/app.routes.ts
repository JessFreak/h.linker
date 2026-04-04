import { Route } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';

export const appRoutes: Route[] = [
  { path: 'login', component: AuthComponent },
  { path: 'register', component: AuthComponent },
];
