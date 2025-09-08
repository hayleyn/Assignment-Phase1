// app.routes.ts
// this file defines the application routes and applies necessary guards
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

// Application routes definition
export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },

  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'groups/:id', loadComponent: () => import('./pages/group-detail/group-detail.component').then(m => m.GroupDetailComponent) },
      { path: 'channels/:id', loadComponent: () => import('./pages/channel-chat/channel-chat.component').then(m => m.ChannelChatComponent) },
    ],
  },

  { path: '**', redirectTo: '' },
];
