import { Routes } from '@angular/router';
import { Home } from '../modules/rou/home/home';

export const routes: Routes = [
  {
    path: 'comp',
    loadChildren: () =>
      import('../modules/comp/comp-routing-module').then((m) => m.CompRoutingModule),
  },
  {
    path: 'home',
    loadChildren: () => import('../modules/home/home-module').then((m) => m.HomeModule),
  },
  {
    path: 'animal',
    loadChildren: () => import('../modules/animal/animal-module').then((m) => m.AnimalModule),
  },
  {
    path: 'fmodeComponent',
    loadChildren: () =>
      import('../modules/fmode-component/fmode-component-module').then(
        (m) => m.FmodeComponentModule,
      ),
  },
  {
    path: 'router',
    children: [
      {
        path: 'home/:id',
        component: Home,
      },
    ],
  },
  {
    path: 'backend',
    loadChildren: () => import('../modules/backend/backend-module').then((m) => m.BackendModule),
  },
  {
    path: '',
    redirectTo: '/comp/list',
    pathMatch: 'full',
  },
];
