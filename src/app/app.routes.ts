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
import { WaitingList } from "./components/waiting-list/waiting-list";
import { Archive } from "./components/archive/archive";
import { Notification } from "./components/notification/notification";
import { ClientRegister } from "./components/client-register/client-register";
import { LandingPage } from "./landing-page/landing-page";
import { Mainlayout } from "./components/mainlayout/mainlayout";
import { CompletedDeals } from "./components/completed-deals/completed-deals";
export const routes: Routes = [
  { path: "", component: LandingPage },

  { path: "login", component: Login },

  {
    path: "",
    component: Mainlayout,
    canActivate: [AuthGuard],
    children: [
      { path: "home", component: Home },
      { path: "cars", component: Cars },
      { path: "employees", component: Employees },
      { path: "portfolio", component: Portfolio },
      { path: "deals", component: Deals },
      { path: "messages", component: Messages },
      { path: "clients", component: Clients },
      { path: "adds", component: Adds },
      { path: "waiting", component: WaitingList },
      { path: "archive", component: Archive },
      { path: "notifications", component: Notification },
      { path: "register", component: Register },
      { path: "client-register", component: ClientRegister },
      { path: "completed-deals", component: CompletedDeals },
    ],
  },

  // أي مسار غير معروف
  { path: "**", redirectTo: "" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes), SpinnerComponent],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppRoutingModule {}
