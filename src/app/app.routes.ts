import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './login/login';
import { Portfolio } from './portfolio/portfolio';
import { About } from './about/about';
import { Services } from './services/services';
import { Gallery } from './gallery/gallery';
import { Faq } from './faq/faq';
import { Contact } from './contact/contact';
import { Home } from './home/home';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'about', component: About },
  { path: 'services', component: Services },
  { path: 'portfolio', component: Portfolio },
  { path: 'gallery', component: Gallery },
  { path: 'faq', component: Faq },
  { path: 'contact', component: Contact },
  { path: 'home', component: Home },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
