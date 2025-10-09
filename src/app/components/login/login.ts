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
import { AuthService } from "../../services/authservice";
import { finalize } from "rxjs";

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
  isLoading = false;
  errorMessage = "";
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
  constructor(
    private fb: FormBuilder,
    public router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ["", [Validators.required]],
      password: ["", Validators.required],
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

 onSubmit() {
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  this.isLoading = true;
  this.errorMessage = "";

  this.authService
    .login(this.loginForm.value)
    .pipe(finalize(() => (this.isLoading = false)))
    .subscribe({
      next: (res) => {
        console.log('Login response:', res); 
        localStorage.setItem("token", res.token); 
        this.isLoggedIn = true;
        this.router.navigate(["/home"]);
        this.activePage = "home";
      },
      error: (err) => {
        console.error('Login error:', err);
        this.errorMessage = "اسم المستخدم أو كلمة المرور غير صحيحة";
      },
    });
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
