import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { authGuard } from './guards/auth.guard';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DashboardHomeComponent } from './components/dashboard/dashboard-home/dashboard-home.component';
import { SectorViewComponent } from './components/dashboard/sector-view/sector-view.component';
import { SubsectorViewComponent } from './components/dashboard/subsector-view/subsector-view.component';
import { SearchResultsComponent } from './components/dashboard/search-results/search-results.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardHomeComponent, pathMatch: 'full' },
      { path: 'sector/:id', component: SectorViewComponent },
      { path: 'subsector/:id', component: SubsectorViewComponent },
      { path: 'search', component: SearchResultsComponent },
    ]
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];