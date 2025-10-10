import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { Login } from "./components/login/login";
import { Portfolio } from "./components/portfolio/portfolio";
import { Cars } from "./components/cars/cars";
import { Employees } from "./components/employees/employees";
import { Deals } from "./components/deals/deals";
import { Messages } from "./components/messages/messages";
import { Clients } from "./components/clients/clients";
import { Home } from "./components/home/home";
import { AuthGuard } from "./shared/authguard";
import { Register } from "./components/register/register";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  { path: "login", component: Login },
  { path: "cars", component: Cars },
  { path: "employees", component: Employees },
  { path: "portfolio", component: Portfolio },
  { path: "deals", component: Deals },
  { path: "messages", component: Messages },
  { path: "clients", component: Clients },
  { path: "home", component: Home },
  { path: "register", component: Register },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
