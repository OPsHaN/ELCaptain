import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './login/login';
import { Portfolio } from './portfolio/portfolio';
import { Cars } from './cars/cars';
import { Employees } from './employees/employees';
import { Deals } from './deals/deals';
import { Messages } from './messages/messages';
import { Clients } from './clients/clients';
import { Home } from './home/home';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'cars', component: Cars },
  { path: 'employees', component: Employees },
  { path: 'portfolio', component: Portfolio },
  { path: 'deals', component: Deals },
  { path: 'messages', component: Messages },
  { path: 'clients', component: Clients },
  { path: 'home', component: Home },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
