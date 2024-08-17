import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadComponent: () =>
          import('../tab1/tab1.page').then((m) => m.Tab1Page),
      },
      {
        path: 'tab2',
        loadComponent: () =>
          import('../tab2/tab2.page').then((m) => m.Tab2Page),
      },
      {
        path: 'tab3',
        loadComponent: () =>
          import('../tab3/tab3.page').then((m) => m.Tab3Page),
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'landing',
    loadComponent: () => import('../landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('../login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup-info',
    loadComponent: () => import('../signup-info/signup-info.component').then((m) => m.SignupInfoComponent),
  },
  {
    path: 'signup-details',
    loadComponent: () => import('../signup-details/signup-details.component').then((m) => m.SignupDetailsComponent),
  },
  {
    path: '',
    redirectTo: '/landing',
    pathMatch: 'full',
  },
];
