import { Route } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { ProfileSettingsComponent } from './components/profile-settings/profile-settings.component';

export const appRoutes: Route[] = [
  { path: 'login', component: AuthComponent },
  { path: 'register', component: AuthComponent },
  { path: 'profile/settings', component: ProfileSettingsComponent },
];
