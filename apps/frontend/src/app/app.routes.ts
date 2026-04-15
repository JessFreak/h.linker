import { Route } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { ProfileSettingsComponent } from './components/profile-settings/profile-settings.component';
import { guestGuard } from './utils/guards/guest.guard';
import { MainPageComponent } from './components/main-page/main-page.component';
import { authGuard } from './utils/guards/auth.guard';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { TeamsComponent } from './components/teams/teams.component';
import { TeamDetailsComponent } from './components/team-details/team-details.component';

export const appRoutes: Route[] = [
  { path: '', component: MainPageComponent, pathMatch: 'full' },
  { path: 'login', component: AuthComponent, canActivate: [guestGuard] },
  { path: 'register', component: AuthComponent, canActivate: [guestGuard] },
  {
    path: 'profile/settings',
    component: ProfileSettingsComponent,
    canActivate: [authGuard],
  },
  { path: 'users/:username', component: UserProfileComponent },
  { path: 'teams', component: TeamsComponent },
  { path: 'teams/:id', component: TeamDetailsComponent },
  { path: '**', redirectTo: '' },
];
