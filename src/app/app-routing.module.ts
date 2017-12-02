import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { ChartComponent } from './chart/chart.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'chart', component: ChartComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent }
];

@NgModule({
  exports:[
    RouterModule
  ],
  imports:[ RouterModule.forRoot(routes)]
})
export class AppRoutingModule { }
