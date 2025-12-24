import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path:'',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path:'home',
    loadComponent: () => import('./components/connect/connect.component').then(m => m.ConnectComponent)
  },
];
