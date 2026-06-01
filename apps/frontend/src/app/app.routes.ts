import { ResolveFn, Route } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { ProfileSettingsComponent } from './components/user-profile/profile-settings/profile-settings.component';
import { guestGuard } from './utils/guards/guest.guard';
import { MainPageComponent } from './components/main-page/main-page.component';
import { authGuard } from './utils/guards/auth.guard';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { TeamsComponent } from './components/teams/teams.component';
import TeamDetailsComponent from './components/teams/team-details/team-details.component';
import { TeamSettingsComponent } from './components/teams/team-details/team-setttings/team-settings.component';
import { UsersComponent } from './components/teams/users/users.component';
import { HackathonConstructorComponent } from './components/hackathons/hackathon-constructor/hackathon-constructor.component';
import { HackathonViewComponent } from './components/hackathons/hackathon-view/hackathon-view.component';
import { HackathonExploreComponent } from './components/hackathons/hackathon-explore/hackathon-explore.component';
import { HackathonDashboardComponent } from './components/hackathons/hackathon-view/hackathon-dashboard/hackathon-dashboard.component';
import { HackathonSubmissionComponent } from './components/hackathons/hackathon-view/hackathon-dashboard/hackathon-submission/hackathon-submission.component';
import { LeaderboardComponent } from './components/hackathons/hackathon-view/leaderboard/leaderboard.component';
import { JuryEvaluationComponent } from './components/hackathons/jury-evaluation/jury-evaluation.component';
import { ProjectShowcaseComponent } from './components/project-showcase/project-showcase.component';
import { HackathonInsightsComponent } from './components/hackathons/hackathon-view/hackathon-insights/hackathon-insights.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { inject } from '@angular/core';
import { HackathonService } from './services/hackathon.service';
import { map } from 'rxjs';

const hackathonTitleResolver: ResolveFn<string> = (route) => {
  const hackathonService = inject(HackathonService);
  const slug = route.paramMap.get('slug');

  if (!slug) return 'Event | h.linker';

  return hackathonService
    .getBySlug(slug)
    .pipe(map((h) => `${h.title} | h.linker`));
};

const leaderboardTitleResolver: ResolveFn<string> = (route) => {
  const hackathonService = inject(HackathonService);
  const slug = route.paramMap.get('slug');

  if (!slug) return 'Leaderboard | h.linker';

  return hackathonService
    .getBySlug(slug)
    .pipe(map((h) => `${h.title} - Leaderboard | h.linker`));
};

const userProfileTitleResolver: ResolveFn<string> = (route) => {
  const username = route.paramMap.get('username');
  return `${username ?? 'User'} - Profile | h.linker`;
};

export const appRoutes: Route[] = [
  {
    path: '',
    component: MainPageComponent,
    pathMatch: 'full',
    title: 'h.linker | Hackathon Platform',
  },
  {
    path: 'login',
    component: AuthComponent,
    canActivate: [guestGuard],
    title: 'Login | h.linker',
  },
  {
    path: 'register',
    component: AuthComponent,
    canActivate: [guestGuard],
    title: 'Register | h.linker',
  },
  {
    path: 'profile/settings',
    component: ProfileSettingsComponent,
    canActivate: [authGuard],
    title: 'Profile Settings | h.linker',
  },
  { path: 'users', component: UsersComponent, title: 'Users | h.linker' },
  {
    path: 'users/:username',
    component: UserProfileComponent,
    title: userProfileTitleResolver,
  },
  { path: 'teams', component: TeamsComponent, title: 'Teams | h.linker' },
  {
    path: 'teams/:id',
    component: TeamDetailsComponent,
    title: 'Team Details | h.linker',
  },
  {
    path: 'teams/:id/settings',
    component: TeamSettingsComponent,
    canActivate: [authGuard],
    title: 'Team Settings | h.linker',
  },

  {
    path: 'events',
    component: HackathonExploreComponent,
    title: 'Explore Hackathons | h.linker',
  },
  {
    path: 'events/constructor',
    component: HackathonConstructorComponent,
    canActivate: [authGuard],
    title: 'Create Hackathon | h.linker',
  },

  {
    path: 'events/:slug',
    component: HackathonViewComponent,
    title: hackathonTitleResolver,
  },
  {
    path: 'events/:id/insights',
    component: HackathonInsightsComponent,
    title: 'Hackathon Insights | h.linker',
  },
  {
    path: 'events/:slug/dashboard',
    component: HackathonDashboardComponent,
    canActivate: [authGuard],
    title: 'Dashboard | h.linker',
  },
  {
    path: 'events/:slug/dashboard/submission',
    component: HackathonSubmissionComponent,
    canActivate: [authGuard],
    title: 'Submit Project | h.linker',
  },

  {
    path: 'events/:slug/leaderboard',
    component: LeaderboardComponent,
    title: leaderboardTitleResolver,
  },
  {
    path: 'events/:slug/jury',
    component: JuryEvaluationComponent,
    canActivate: [authGuard],
    title: 'Jury Evaluation | h.linker',
  },
  {
    path: 'showcase',
    component: ProjectShowcaseComponent,
    title: 'Project Showcase | h.linker',
  },
  {
    path: '404',
    component: NotFoundComponent,
    title: 'Page Not Found | h.linker',
  },
  { path: '**', redirectTo: '404' },
];
