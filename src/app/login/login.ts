import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import {
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
} from "@angular/router";

@Component({
  selector: "app-login",
  standalone: true,
  templateUrl: "./login.html",
  styleUrls: ["./login.scss"],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
})
export class Login {
  loginForm: FormGroup;
  showPassword = false;
  isLoggedIn = false;
  activePage: string = "home";

  buttons = [
    { label: "الرئيسية", route: "home", icon: "bi bi-house" },
    { label: "السيارات ", route: "./cars", icon: "bi bi-car-front" },
    { label: "الموظفين", route: "/employees", icon: "bi bi-people" },
    { label: "العملاء ", route: "./clients", icon: "bi bi-person-lines-fill" },
    { label: "الصفقات", route: "/deals", icon: "bi bi-briefcase" },
    { label: "الرسائل", route: "/messages", icon: "bi bi-envelope" },

    {
      label: "خروج",
      action: () => this.logout(),
      icon: "bi bi-box-arrow-right",
    },
  ];
  constructor(private fb: FormBuilder, public router: Router) {
    this.loginForm = this.fb.group({
      username: ["", [Validators.required, Validators.required]],
      password: ["", Validators.required],
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // يخلّى كل الحقول تُظهر الأخطاء
      return;
    }

    this.isLoggedIn = true;
    this.router.navigate(["/home"]); // أول ما يسجل يدخل على الرئيسية
    this.activePage = "home"; // ✅ غيّر الصفحة المعروضة
  }

  goTo(route: string) {
    this.activePage = route; // ✅ غيّر الصفحة المعروضة
  }

  logout() {
    this.isLoggedIn = false;
    this.loginForm.reset();
    this.router.navigate(["/login"]);
    this.activePage = "home"; // رجّع الصفحة المعروضة للرئيسية
  }
}
