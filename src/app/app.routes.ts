import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
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
import { Adds } from "./components/adds/adds";
import { SpinnerComponent } from "./shared/spinner/spinner.component";

export const routes: Routes = [
  // {
  //   path: "",
  //   redirectTo: localStorage.getItem("lastRoute") || "home",
  //   pathMatch: "full",
  // },
  { path: "login", component: Login },
  { path: "cars", component: Cars },
  { path: "employees", component: Employees },
  { path: "portfolio", component: Portfolio },
  { path: "deals", component: Deals },
  { path: "messages", component: Messages },
  { path: "clients", component: Clients },
  { path: "home", component: Home },
  { path: "register", component: Register },
  { path: "adds", component: Adds },
];

@NgModule({
  imports: [RouterModule.forRoot(routes), SpinnerComponent],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppRoutingModule {}
