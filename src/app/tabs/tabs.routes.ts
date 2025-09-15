import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('../home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'candidates',
        loadComponent: () =>
          import('../candidates/candidates.page').then((m) => m.CandidatesPage),
      },
      {
        path: 'vote',
        loadComponent: () =>
          import('../vote/vote.page').then((m) => m.VotePage),
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'landing',
    loadComponent: () =>
      import('../landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('../login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('../profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'signup-info',
    loadComponent: () =>
      import('../signup-info/signup-info.component').then(
        (m) => m.SignupInfoComponent
      ),
  },
  {
    path: '',
    redirectTo: '/landing',
    pathMatch: 'full',
  },
];
